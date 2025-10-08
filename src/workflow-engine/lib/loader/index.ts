import { WorkflowDefinition } from '../types/workflow';
import { WorkflowValidator } from './validator';
import { WorkflowWatcher } from './watcher';
import { WorkflowRegistry } from './registry';
import { withRetry, retryConditions } from '../utils/retry';
import { ErrorHandler, errorContexts } from '../utils/error-handler';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export class WorkflowLoader {
  private validator: WorkflowValidator;
  private watcher: WorkflowWatcher;
  private registry: WorkflowRegistry;
  private config: WorkflowLoaderConfig;

  constructor(config: WorkflowLoaderConfig) {
    this.config = config;
    this.validator = new WorkflowValidator();
    this.watcher = new WorkflowWatcher(config.watchMode);
    this.registry = new WorkflowRegistry();

    // Setup file watching if enabled
    if (config.watchMode) {
      this.setupWatchers();
    }
  }

  async loadWorkflows(): Promise<WorkflowLoadResult> {
    const startTime = Date.now();
    const result: WorkflowLoadResult = {
      loaded: [],
      errors: [],
      skipped: [],
      duration: 0,
    };

    try {
      // Find all workflow files
      const workflowFiles = await this.findWorkflowFiles();

      // Load and validate each workflow
      for (const file of workflowFiles) {
        try {
          const workflow = await this.loadWorkflowFile(file);
          const validation = this.validator.validate(workflow);

          if (validation.valid) {
            await this.registry.register(workflow);
            result.loaded.push({
              id: workflow.id,
              name: workflow.name,
              file: file,
            });
          } else {
            result.errors.push({
              file: file,
              errors: validation.errors,
            });
          }
        } catch (error) {
          const enhancedError = ErrorHandler.handleError(
            error as Error,
            errorContexts.workflowLoader('loadWorkflowFile', path.basename(file))
          );
          
          result.errors.push({
            file: file,
            errors: [ErrorHandler.formatError(enhancedError)],
          });
        }
      }

      // Deploy to N8N if configured
      if (this.config.autoDeploy) {
        await this.deployToN8N(result.loaded);
      }

    } catch (error) {
      result.errors.push({
        file: 'loader',
        errors: [`Loader error: ${error.message}`],
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async findWorkflowFiles(): Promise<string[]> {
    return withRetry(async () => {
      const workflowsDir = this.config.workflowsDir;
      const extensions = this.config.supportedExtensions;

      const files: string[] = [];

      for (const ext of extensions) {
        const pattern = path.join(workflowsDir, `**/*.${ext}`);
        const matches = await glob(pattern);
        files.push(...matches);
      }

      return files;
    }, {
      maxRetries: 3,
      retryCondition: retryConditions.networkError,
    });
  }

  private async loadWorkflowFile(filePath: string): Promise<WorkflowDefinition> {
    const extension = path.extname(filePath);

    switch (extension) {
      case '.ts':
        return await this.loadTypeScriptWorkflow(filePath);
      case '.js':
        return await this.loadJavaScriptWorkflow(filePath);
      case '.json':
        return await this.loadJSONWorkflow(filePath);
      default:
        throw new Error(`Unsupported workflow file extension: ${extension}`);
    }
  }

  private async loadTypeScriptWorkflow(filePath: string): Promise<WorkflowDefinition> {
    // Compile TypeScript and import
    const compiledPath = await this.compileTypeScript(filePath);
    const module = await import(compiledPath);

    // Extract workflow from module
    const workflowName = this.extractWorkflowName(filePath);
    const workflow = module[workflowName];

    if (!workflow) {
      throw new Error(`Workflow export '${workflowName}' not found in ${filePath}`);
    }

    return workflow;
  }

  private async loadJavaScriptWorkflow(filePath: string): Promise<WorkflowDefinition> {
    const module = await import(filePath);

    // Extract workflow from module
    const workflowName = this.extractWorkflowName(filePath);
    const workflow = module[workflowName];

    if (!workflow) {
      throw new Error(`Workflow export '${workflowName}' not found in ${filePath}`);
    }

    return workflow;
  }

  private async loadJSONWorkflow(filePath: string): Promise<WorkflowDefinition> {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  private async compileTypeScript(filePath: string): Promise<string> {
    // Use TypeScript compiler API or ts-node
    const tsNode = require('ts-node');
    const compiler = tsNode.create({
      transpileOnly: true,
      compilerOptions: {
        module: 'commonjs',
        target: 'es2020',
      },
    });

    return compiler.compile(filePath, fs.readFileSync(filePath, 'utf8'));
  }

  private extractWorkflowName(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case or snake_case to camelCase
    return basename.replace(/[-_](.)/g, (_, letter) => letter.toUpperCase());
  }

  private setupWatchers(): void {
    this.watcher.on('change', async (filePath) => {
      console.log(`🔄 Workflow changed: ${filePath}`);
      await this.reloadWorkflow(filePath);
    });

    this.watcher.on('add', async (filePath) => {
      console.log(`➕ New workflow: ${filePath}`);
      await this.loadWorkflowFile(filePath);
    });

    this.watcher.on('delete', async (filePath) => {
      console.log(`➖ Workflow removed: ${filePath}`);
      await this.unloadWorkflow(filePath);
    });
  }

  private async reloadWorkflow(filePath: string): Promise<void> {
    try {
      const workflow = await this.loadWorkflowFile(filePath);
      const validation = this.validator.validate(workflow);

      if (validation.valid) {
        await this.registry.update(workflow);
        await this.deployToN8N([{ id: workflow.id, name: workflow.name, file: filePath }]);
        console.log(`✅ Workflow reloaded: ${workflow.name}`);
      } else {
        console.error(`❌ Validation failed for ${filePath}:`, validation.errors);
      }
    } catch (error) {
      console.error(`❌ Failed to reload workflow ${filePath}:`, error.message);
    }
  }

  private async unloadWorkflow(filePath: string): Promise<void> {
    const workflowId = this.extractWorkflowName(filePath);
    await this.registry.unregister(workflowId);
    // Remove from N8N if configured
  }

  private async deployToN8N(workflows: Array<{id: string, name: string, file: string}>): Promise<void> {
    if (!this.config.n8nUrl) return;

    for (const workflow of workflows) {
      try {
        await this.deploySingleWorkflow(workflow);
      } catch (error) {
        console.error(`❌ Failed to deploy workflow ${workflow.name}:`, error.message);
      }
    }
  }

  private async deploySingleWorkflow(workflow: {id: string, name: string, file: string}): Promise<void> {
    // Implementation depends on N8N API version
    // For N8N v0.x:
    // const response = await fetch(`${this.config.n8nUrl}/rest/workflows`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(workflow),
    // });

    // For N8N v1.x:
    // Use N8N REST API to create/update workflows
  }
}

export interface WorkflowLoaderConfig {
  workflowsDir: string;
  supportedExtensions: string[];
  watchMode: boolean;
  autoDeploy: boolean;
  n8nUrl?: string;
  n8nApiKey?: string;
  validateOnLoad: boolean;
}

export interface WorkflowLoadResult {
  loaded: Array<{id: string, name: string, file: string}>;
  errors: Array<{file: string, errors: string[]}>;
  skipped: Array<{file: string, reason: string}>;
  duration: number;
}

