# Code-Defined Workflows

Comprehensive system for defining, loading, and managing N8N workflows as code with automatic deployment and hot reload capabilities.

## Overview

This system transforms N8N workflow management by:
- **Code-First Approach** - Define workflows in TypeScript/JavaScript instead of JSON
- **Version Control** - Workflows are tracked in Git with proper versioning
- **Auto-Loading** - Automatic loading and hot reload without manual uploads
- **Type Safety** - Full TypeScript support with compile-time validation
- **Testing** - Comprehensive testing framework for workflows
- **CI/CD Integration** - Seamless deployment and rollback capabilities

## Architecture

```
workflows/
├── loader/                    # Workflow loading system
│   ├── index.ts              # Main loader implementation
│   ├── types.ts              # TypeScript definitions
│   ├── validator.ts          # Workflow validation
│   └── watcher.ts            # File watching for hot reload
├── definitions/              # Workflow definitions
│   ├── code-review.ts        # Code review workflow
│   ├── refactoring.ts        # Refactoring workflow
│   ├── testing.ts           # Testing workflow
│   └── documentation.ts     # Documentation workflow
├── tests/                    # Workflow tests
│   ├── code-review.test.ts
│   ├── integration.test.ts
│   └── utils.ts
└── config/
    └── workflows.json       # Workflow configuration
```

## TypeScript Definitions

**lib/types/workflow.ts:**
```typescript
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags?: string[];
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings?: WorkflowSettings;
  staticData?: any;
  pinData?: any;
  meta?: WorkflowMeta;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  disabled?: boolean;
  webhookId?: string;
  credentials?: Record<string, any>;
}

export interface WorkflowConnections {
  [nodeName: string]: {
    main?: Array<Array<{
      node: string;
      type: 'main' | 'success' | 'error';
      index: number;
    }>>;
    [outputType: string]: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface WorkflowSettings {
  executionOrder: 'v0' | 'v1';
  saveExecutionProgress: boolean;
  saveManualExecutions: boolean;
  saveDataErrorExecution: string;
  saveDataSuccessExecution: string;
  errorWorkflow?: string;
  timezone: string;
  saveDataSuccessExecution: string;
}

export interface WorkflowMeta {
  instanceId?: string;
  templateId?: string;
  templateCredsSetupCompleted?: boolean;
}

export interface WorkflowExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
  duration?: number;
}
```

## Workflow Loader Implementation

**lib/loader/index.ts:**
```typescript
import { WorkflowDefinition } from '../types/workflow';
import { WorkflowValidator } from './validator';
import { WorkflowWatcher } from './watcher';
import { WorkflowRegistry } from './registry';
import fs from 'fs';
import path from 'path';

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
          result.errors.push({
            file: file,
            errors: [`Failed to load workflow: ${error.message}`],
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
    const workflowsDir = this.config.workflowsDir;
    const extensions = this.config.supportedExtensions;

    const files: string[] = [];

    for (const ext of extensions) {
      const pattern = path.join(workflowsDir, `**/*.${ext}`);
      const matches = await glob(pattern);
      files.push(...matches);
    }

    return files;
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
```

## Workflow Definitions

### Code Review Workflow

**workflows/definitions/code-review.ts:**
```typescript
import { WorkflowDefinition } from '../../lib/types/workflow';

export const codeReviewWorkflow: WorkflowDefinition = {
  id: 'code-review-workflow',
  name: 'AI Code Review',
  description: 'Automated code review using Cursor CLI',
  version: '1.0.0',
  tags: ['ai', 'review', 'development'],
  active: true,

  nodes: [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'code-review',
        responseMode: 'responseNode',
        options: {
          responseContentType: 'json',
        },
      },
    },
    {
      id: 'extract-input',
      name: 'Extract Input Data',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: `
          // Extract and validate input data
          const inputData = $input.all();

          if (!inputData[0]?.json?.prompt) {
            throw new Error('Prompt is required');
          }

          return [{
            json: {
              prompt: inputData[0].json.prompt,
              projectPath: inputData[0].json.projectPath || process.cwd(),
              model: inputData[0].json.model || 'claude-4-sonnet',
              branch: inputData[0].json.branch || 'main',
              files: inputData[0].json.files || [],
            }
          }];
        `,
      },
    },
    {
      id: 'cursor-execute',
      name: 'Execute Cursor Review',
      type: 'custom-cursor-execute',
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        prompt: `
          Review the following code for:
          1. Security vulnerabilities
          2. Performance issues
          3. Code quality and best practices
          4. Potential bugs
          5. Documentation needs

          Project: {{ $json.projectPath }}
          Branch: {{ $json.branch }}
          Files: {{ JSON.stringify($json.files) }}

          Please provide a comprehensive review with specific recommendations.
        `,
        projectPath: '{{ $json.projectPath }}',
        model: '{{ $json.model }}',
        timeout: 300,
      },
    },
    {
      id: 'parse-response',
      name: 'Parse Cursor Response',
      type: 'custom-cursor-parse',
      typeVersion: 1,
      position: [900, 300],
      parameters: {
        outputFormat: 'auto',
        extractCodeBlocks: true,
        extractSuggestions: true,
      },
    },
    {
      id: 'validate-output',
      name: 'Validate Review Quality',
      type: 'custom-cursor-validate',
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        validationRules: {
          rules: [
            {
              type: 'minLength',
              value: '100',
            },
            {
              type: 'contains',
              value: 'review',
            },
            {
              type: 'noErrors',
            },
          ],
        },
        extractMetrics: true,
      },
    },
    {
      id: 'create-github-comment',
      name: 'Create GitHub Comment',
      type: 'n8n-nodes-base.github',
      typeVersion: 1,
      position: [1340, 200],
      parameters: {
        operation: 'createComment',
        repository: '={{ $json.repository }}',
        issueNumber: '={{ $json.prNumber }}',
        body: `
          ## 🤖 AI Code Review

          **Review Summary:**
          {{ $json.parsedOutput.title || "Code Review Completed" }}

          **Key Findings:**
          {{ $json.suggestions.slice(0, 5).join("\\n- ") }}

          **Confidence:** {{ $json.confidence }}%
          **Review Time:** {{ $json.metrics.wordCount }} words analyzed

          _Generated by Cursor CLI via N8N automation_
        `,
      },
      credentials: {
        githubApi: {
          id: 'github-token',
          name: 'GitHub API Token',
        },
      },
    },
    {
      id: 'success-response',
      name: 'Success Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1560, 200],
      parameters: {
        respondWith: 'json',
        responseBody: `{
          "success": true,
          "message": "Code review completed",
          "reviewId": "{{ $json.executionId }}",
          "findings": {{ $json.suggestions.length }},
          "confidence": "{{ $json.confidence }}%"
        }`,
      },
    },
    {
      id: 'error-response',
      name: 'Error Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1560, 400],
      parameters: {
        respondWith: 'json',
        responseBody: `{
          "success": false,
          "error": "{{ $json.error }}",
          "validationIssues": {{ $json.issues | length }}
        }`,
      },
    },
  ],

  connections: {
    'Webhook Trigger': {
      main: [
        [
          {
            node: 'Extract Input Data',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Extract Input Data': {
      main: [
        [
          {
            node: 'Cursor Execute',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Cursor Execute': {
      main: [
        [
          {
            node: 'Parse Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Parse Response': {
      main: [
        [
          {
            node: 'Validate Output',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Validate Output': {
      main: [
        [
          {
            node: 'Create GitHub Comment',
            type: 'main',
            index: 0,
          },
        ],
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Create GitHub Comment': {
      main: [
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Validate Output': {
      main: [
        [
          {
            node: 'Error Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
  },

  settings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
    saveManualExecutions: false,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    timezone: 'America/New_York',
  },

  meta: {
    templateId: 'code-review-template',
    instanceId: 'production',
  },
};
```

### Refactoring Workflow

**workflows/definitions/refactoring.ts:**
```typescript
import { WorkflowDefinition } from '../../lib/types/workflow';

export const refactoringWorkflow: WorkflowDefinition = {
  id: 'refactoring-workflow',
  name: 'AI Code Refactoring',
  description: 'Automated code refactoring using Cursor CLI',
  version: '1.0.0',
  tags: ['ai', 'refactoring', 'automation'],
  active: true,

  nodes: [
    // Webhook trigger for manual refactoring requests
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'refactor',
        responseMode: 'responseNode',
      },
    },

    // Extract and validate refactoring request
    {
      id: 'extract-request',
      name: 'Extract Refactoring Request',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
          const request = $input.first().json;

          return [{
            json: {
              targetFiles: request.files || [],
              refactoringType: request.type || 'general',
              projectPath: request.projectPath || process.cwd(),
              model: request.model || 'claude-4-sonnet',
              createBackup: request.createBackup !== false,
              dryRun: request.dryRun || false,
            }
          }];
        `,
      },
    },

    // Execute refactoring with Cursor CLI
    {
      id: 'cursor-refactor',
      name: 'Execute Refactoring',
      type: 'custom-cursor-execute',
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        prompt: `
          Perform code refactoring on the specified files:

          Refactoring Type: {{ $json.refactoringType }}
          Target Files: {{ JSON.stringify($json.targetFiles) }}

          Focus on:
          1. Code organization and structure
          2. Performance optimizations
          3. Best practices implementation
          4. Maintainability improvements

          {{ $json.dryRun ? 'DRY RUN: Show what would be changed without making modifications' : 'Apply the refactoring changes' }}
        `,
        projectPath: '{{ $json.projectPath }}',
        model: '{{ $json.model }}',
        timeout: 600,
      },
    },

    // Parse refactoring results
    {
      id: 'parse-refactoring',
      name: 'Parse Refactoring Results',
      type: 'custom-cursor-parse',
      typeVersion: 1,
      position: [900, 300],
      parameters: {
        outputFormat: 'auto',
        extractCodeBlocks: true,
        extractSuggestions: true,
      },
    },

    // Apply file changes if not dry run
    {
      id: 'apply-changes',
      name: 'Apply File Changes',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1120, 200],
      parameters: {
        jsCode: `
          if ($input.first().json.dryRun) {
            return [{
              json: {
                applied: false,
                dryRun: true,
                changes: $input.first().json.codeBlocks,
              }
            }];
          }

          // Apply actual file changes
          const fs = require('fs');
          const changes = $input.first().json.codeBlocks;

          for (const change of changes) {
            if (change.filePath && change.content) {
              fs.writeFileSync(change.filePath, change.content);
            }
          }

          return [{
            json: {
              applied: true,
              dryRun: false,
              filesModified: changes.length,
            }
          }];
        `,
      },
    },

    // Success response
    {
      id: 'success-response',
      name: 'Success Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1340, 200],
      parameters: {
        respondWith: 'json',
        responseBody: `{
          "success": true,
          "message": "Refactoring completed",
          "filesModified": {{ $json.filesModified || 0 }},
          "dryRun": {{ $json.dryRun || false }}
        }`,
      },
    },
  ],

  connections: {
    'Webhook Trigger': {
      main: [
        [
          {
            node: 'Extract Refactoring Request',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Extract Refactoring Request': {
      main: [
        [
          {
            node: 'Cursor Refactor',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Cursor Refactor': {
      main: [
        [
          {
            node: 'Parse Refactoring Results',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Parse Refactoring Results': {
      main: [
        [
          {
            node: 'Apply Changes',
            type: 'main',
            index: 0,
          },
        ],
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Apply Changes': {
      main: [
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
  },
};
```

### Testing Workflow

**workflows/definitions/testing.ts:**
```typescript
import { WorkflowDefinition } from '../../lib/types/workflow';

export const testingWorkflow: WorkflowDefinition = {
  id: 'testing-workflow',
  name: 'AI Test Generation',
  description: 'Automated test generation using Cursor CLI',
  version: '1.0.0',
  tags: ['ai', 'testing', 'automation'],
  active: true,

  nodes: [
    // Webhook trigger for test generation requests
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'generate-tests',
        responseMode: 'responseNode',
      },
    },

    // Extract test generation parameters
    {
      id: 'extract-params',
      name: 'Extract Test Parameters',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        jsCode: `
          const request = $input.first().json;

          return [{
            json: {
              sourceFiles: request.files || [],
              testFramework: request.framework || 'jest',
              coverageTarget: request.coverage || 80,
              projectPath: request.projectPath || process.cwd(),
              model: request.model || 'claude-4-sonnet',
              includeMocks: request.includeMocks !== false,
            }
          }];
        `,
      },
    },

    // Generate tests with Cursor CLI
    {
      id: 'generate-tests',
      name: 'Generate Tests',
      type: 'custom-cursor-execute',
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        prompt: `
          Generate comprehensive unit tests for the following files:

          Source Files: {{ JSON.stringify($json.sourceFiles) }}
          Test Framework: {{ $json.testFramework }}
          Coverage Target: {{ $json.coverageTarget }}%

          Requirements:
          1. Cover all public methods and edge cases
          2. Include proper mocking for dependencies
          3. Test error scenarios and edge cases
          4. Follow {{ $json.testFramework }} best practices
          5. Ensure high test coverage

          Generate test files that can be run immediately.
        `,
        projectPath: '{{ $json.projectPath }}',
        model: '{{ $json.model }}',
        timeout: 600,
      },
    },

    // Parse generated tests
    {
      id: 'parse-tests',
      name: 'Parse Test Results',
      type: 'custom-cursor-parse',
      typeVersion: 1,
      position: [900, 300],
      parameters: {
        outputFormat: 'auto',
        extractCodeBlocks: true,
        extractSuggestions: true,
      },
    },

    // Write test files
    {
      id: 'write-tests',
      name: 'Write Test Files',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1120, 300],
      parameters: {
        jsCode: `
          const fs = require('fs');
          const path = require('path');
          const testResults = $input.first().json;

          for (const codeBlock of testResults.codeBlocks) {
            if (codeBlock.language === 'javascript' || codeBlock.language === 'typescript') {
              const fileName = codeBlock.fileName || 'generated-test.js';
              const filePath = path.join($input.first().json.projectPath, '__tests__', fileName);

              // Ensure directory exists
              fs.mkdirSync(path.dirname(filePath), { recursive: true });

              // Write test file
              fs.writeFileSync(filePath, codeBlock.content);
            }
          }

          return [{
            json: {
              testFilesCreated: testResults.codeBlocks.length,
              projectPath: $input.first().json.projectPath,
            }
          }];
        `,
      },
    },

    // Run tests to validate
    {
      id: 'run-tests',
      name: 'Run Generated Tests',
      type: 'n8n-nodes-base.executeCommand',
      typeVersion: 1,
      position: [1340, 300],
      parameters: {
        command: 'cd "{{ $json.projectPath }}" && npm test -- --testPathPattern="__tests__" --verbose',
        executeOnce: true,
      },
    },

    // Success response
    {
      id: 'success-response',
      name: 'Success Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1560, 200],
      parameters: {
        respondWith: 'json',
        responseBody: `{
          "success": true,
          "message": "Tests generated successfully",
          "testFilesCreated": {{ $json.testFilesCreated }},
          "testResults": {{ $json.stdout || "Tests completed" }}
        }`,
      },
    },
  ],

  connections: {
    'Webhook Trigger': {
      main: [
        [
          {
            node: 'Extract Test Parameters',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Extract Test Parameters': {
      main: [
        [
          {
            node: 'Generate Tests',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Generate Tests': {
      main: [
        [
          {
            node: 'Parse Test Results',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Parse Test Results': {
      main: [
        [
          {
            node: 'Write Test Files',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Write Test Files': {
      main: [
        [
          {
            node: 'Run Tests',
            type: 'main',
            index: 0,
          },
        ],
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'Run Tests': {
      main: [
        [
          {
            node: 'Success Response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
  },
};
```

## Configuration Management

**config/workflows.json:**
```json
{
  "autoLoad": true,
  "watchMode": true,
  "validation": true,
  "hotReload": true,
  "deployment": {
    "autoDeploy": true,
    "n8nUrl": "http://localhost:5678",
    "n8nApiKey": "${N8N_API_KEY}",
    "environment": "development"
  },
  "logging": {
    "level": "info",
    "file": "./logs/workflows.log",
    "maxSize": "10MB",
    "maxFiles": 5
  },
  "performance": {
    "cacheEnabled": true,
    "cacheTTL": 300000,
    "maxConcurrentLoads": 5,
    "retryAttempts": 3,
    "retryDelay": 1000
  },
  "validation": {
    "strictMode": true,
    "customRules": [
      {
        "name": "unique-node-names",
        "enabled": true,
        "severity": "error"
      },
      {
        "name": "valid-connections",
        "enabled": true,
        "severity": "error"
      }
    ]
  }
}
```

## Testing Framework

**tests/workflows/code-review.test.ts:**
```typescript
import { executeWorkflow } from '../../lib/executor';
import { codeReviewWorkflow } from '../../workflows/definitions/code-review';

describe('Code Review Workflow', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    // Cleanup test environment
  });

  test('should execute code review successfully', async () => {
    const input = {
      prompt: 'Review this authentication module for security issues',
      projectPath: '/test/project',
      model: 'claude-4-sonnet',
    };

    const result = await executeWorkflow(codeReviewWorkflow, input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.output).toContain('review');
    expect(result.duration).toBeLessThan(300000); // 5 minutes
  });

  test('should handle validation errors', async () => {
    const input = {
      prompt: '', // Invalid empty prompt
      projectPath: '/test/project',
    };

    const result = await executeWorkflow(codeReviewWorkflow, input);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Prompt is required');
  });

  test('should handle Cursor CLI errors gracefully', async () => {
    // Mock Cursor CLI to return error
    const originalExec = require('child_process').execSync;

    try {
      require('child_process').execSync = jest.fn(() => {
        throw new Error('Cursor CLI execution failed');
      });

      const result = await executeWorkflow(codeReviewWorkflow, {
        prompt: 'Test prompt',
        projectPath: '/test/project',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cursor CLI execution failed');

    } finally {
      require('child_process').execSync = originalExec;
    }
  });

  test('should extract code blocks from response', async () => {
    const mockResponse = `
      ## Code Review Results

      Here's the improved code:

      \`\`\`javascript
      function authenticateUser(user) {
        // Improved authentication logic
        return true;
      }
      \`\`\`

      **Recommendations:**
      - Add input validation
      - Use proper error handling
    `;

    // Mock successful execution
    const result = await executeWorkflow(codeReviewWorkflow, {
      prompt: 'Test review',
      projectPath: '/test/project',
    });

    expect(result.data.parsedOutput.codeBlocks).toHaveLength(1);
    expect(result.data.parsedOutput.codeBlocks[0].language).toBe('javascript');
    expect(result.data.parsedOutput.suggestions).toContain('Add input validation');
  });
});
```

## Hot Reload Implementation

**lib/loader/watcher.ts:**
```typescript
import chokidar from 'chokidar';
import EventEmitter from 'events';

export class WorkflowWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher;
  private watchPaths: string[];

  constructor(watchMode: boolean = true) {
    super();

    if (!watchMode) {
      return;
    }

    this.watchPaths = [
      './workflows/**/*.{ts,js,json}',
      './lib/**/*.{ts,js}',
      './config/workflows.json',
    ];

    this.watcher = chokidar.watch(this.watchPaths, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.{ts,js}',
        '**/coverage/**',
      ],
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.watcher
      .on('add', (path) => {
        this.emit('add', path);
      })
      .on('change', (path) => {
        this.emit('change', path);
      })
      .on('unlink', (path) => {
        this.emit('delete', path);
      })
      .on('error', (error) => {
        this.emit('error', error);
      });
  }

  public close(): Promise<void> {
    return this.watcher?.close() || Promise.resolve();
  }
}
```

## Deployment and CI/CD Integration

### Automated Deployment

**deploy-workflows.sh:**
```bash
#!/bin/bash
# Deploy workflows to N8N

set -e

echo "🚀 Deploying workflows..."

# Build TypeScript workflows
npm run build:workflows

# Validate all workflows
npm run validate:workflows

# Load workflows into N8N
node -e "
  const { WorkflowLoader } = require('./lib/loader');
  const loader = new WorkflowLoader(require('./config/workflows.json'));

  loader.loadWorkflows().then(result => {
    console.log('✅ Deployment completed');
    console.log('📊 Loaded:', result.loaded.length, 'workflows');
    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors.length);
      process.exit(1);
    }
  });
"

echo "✅ Workflows deployed successfully"
```

### GitHub Actions Integration

**.github/workflows/deploy-workflows.yml:**
```yaml
name: Deploy Workflows

on:
  push:
    paths:
      - 'workflows/**'
      - 'lib/loader/**'
      - 'config/workflows.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build workflows
        run: npm run build:workflows

      - name: Validate workflows
        run: npm run validate:workflows

      - name: Deploy to N8N
        run: ./deploy-workflows.sh
        env:
          N8N_URL: ${{ secrets.N8N_URL }}
          N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
```

## Performance Optimization

### Caching System

**lib/loader/cache.ts:**
```typescript
import NodeCache from 'node-cache';

export class WorkflowCache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes
      checkperiod: 60, // Check for expired keys every minute
      maxKeys: 1000, // Maximum number of keys
    });
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
  }

  getStats(): any {
    return this.cache.getStats();
  }
}
```

### Lazy Loading

```typescript
// Load workflows only when needed
class LazyWorkflowLoader {
  private loadedWorkflows = new Map<string, WorkflowDefinition>();
  private loadingPromises = new Map<string, Promise<WorkflowDefinition>>();

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    // Return cached workflow if available
    if (this.loadedWorkflows.has(id)) {
      return this.loadedWorkflows.get(id)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    // Start loading workflow
    const loadPromise = this.loadWorkflow(id);
    this.loadingPromises.set(id, loadPromise);

    try {
      const workflow = await loadPromise;
      this.loadedWorkflows.set(id, workflow);
      return workflow;
    } finally {
      this.loadingPromises.delete(id);
    }
  }
}
```

## Best Practices

1. **Type Safety** - Use TypeScript for all workflow definitions
2. **Validation** - Validate workflows before deployment
3. **Error Handling** - Implement comprehensive error handling
4. **Testing** - Write tests for all workflows
5. **Documentation** - Document workflow inputs, outputs, and behavior
6. **Version Control** - Version workflows and maintain backward compatibility
7. **Performance** - Implement caching and lazy loading
8. **Security** - Validate inputs and sanitize outputs

## Troubleshooting

### Common Issues

**Workflow not loading:**
```bash
# Check file syntax
npx tsc --noEmit workflows/definitions/*.ts

# Validate workflow structure
npm run validate:workflows

# Check N8N logs
docker-compose logs n8n | grep -i workflow
```

**Hot reload not working:**
```bash
# Check file permissions
ls -la workflows/

# Verify watcher is running
ps aux | grep chokidar

# Check for file system issues
lsof workflows/
```

**Deployment failures:**
```bash
# Check N8N connectivity
curl -f http://localhost:5678/healthz

# Verify API key
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/rest/workflows

# Check workflow validation
npm run validate:workflows -- --verbose
```

This comprehensive workflow system transforms N8N from a manual JSON-based tool into a modern, code-first automation platform with enterprise-grade features like type safety, testing, hot reload, and automated deployment.
