# Workflow Development Guide

> **Complete guide to developing TypeScript-based workflows for Agent Flow**

Agent Flow uses TypeScript to define workflows that integrate with N8N's visual workflow engine. This approach provides type safety, better maintainability, and seamless integration with the development environment.

## 🎯 Overview

### Available Workflows
- **Code Review** - Automated code review with AI feedback
- **Refactoring** - Batch code modernization and optimization
- **AI Testing** - Generate comprehensive test suites
- **Documentation** - Auto-updating documentation
- **Bug Fixes** - Intelligent debugging and patch generation

### Workflow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  TypeScript     │───▶│  Workflow Loader │───▶│  N8N Engine     │
│  Definitions    │    │  (Hot Reload)    │    │  (Execution)    │
│                 │    │                  │    │                 │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │ Workflow    ││    │ │ Type Safety  │ │    │ │ Node        │ │
│  │ Structure   ││    │ │ Validation   │ │    │ │ Execution   │ │
│  └─────────────┘│    │ └──────────────┘ │    │ └─────────────┘ │
│        │        │    │        │         │    │        │        │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │ Node        ││    │ │ Hot Reload   │ │    │ │ Custom      │ │
│  │ Definitions ││    │ │ Watcher      │ │    │ │ Activities  │ │
│  └─────────────┘│    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🏗 Workflow Structure

### Basic Workflow Definition
```typescript
import { WorkflowDefinition } from '../../workflow-engine/types/workflow';

export const myWorkflow: WorkflowDefinition = {
  id: 'my-workflow',
  name: 'My Workflow',
  description: 'Description of what this workflow does',
  version: '1.0.0',
  tags: ['ai', 'development'],
  active: true,
  
  nodes: [
    // Node definitions here
  ],
  
  connections: {
    // Node connections here
  },
  
  settings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
    saveManualExecutions: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    timezone: 'UTC',
  },
};
```

### Workflow Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique workflow identifier |
| `name` | string | ✅ | Human-readable workflow name |
| `description` | string | ❌ | Workflow description |
| `version` | string | ✅ | Semantic version |
| `tags` | string[] | ❌ | Categorization tags |
| `active` | boolean | ✅ | Whether workflow is active |
| `nodes` | WorkflowNode[] | ✅ | Array of workflow nodes |
| `connections` | WorkflowConnections | ✅ | Node connections |
| `settings` | WorkflowSettings | ❌ | Workflow execution settings |

## 🔧 Node Types

### 1. Trigger Nodes

#### Webhook Trigger
```typescript
{
  id: 'webhook-trigger',
  name: 'Webhook Trigger',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 2,
  position: [240, 300],
  parameters: {
    httpMethod: 'POST',
    path: 'my-workflow',
    responseMode: 'responseNode',
    options: {
      responseContentType: 'json',
    },
  },
}
```

#### Manual Trigger
```typescript
{
  id: 'manual-trigger',
  name: 'Manual Trigger',
  type: 'n8n-nodes-base.manualTrigger',
  typeVersion: 1,
  position: [240, 300],
  parameters: {},
}
```

### 2. Data Processing Nodes

#### Code Node
```typescript
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
        }
      }];
    `,
  },
}
```

#### Set Node
```typescript
{
  id: 'set-context',
  name: 'Set Context',
  type: 'n8n-nodes-base.set',
  typeVersion: 3,
  position: [680, 300],
  parameters: {
    values: {
      string: [
        {
          name: 'context',
          value: 'Code review context',
        },
      ],
    },
    options: {},
  },
}
```

### 3. Custom Activity Nodes

#### Cursor Execute
```typescript
{
  id: 'cursor-execute',
  name: 'Execute Cursor CLI',
  type: 'n8n-nodes-custom.cursorExecute',
  typeVersion: 1,
  position: [900, 300],
  parameters: {
    prompt: '={{ $json.prompt }}',
    projectPath: '={{ $json.projectPath }}',
    model: '={{ $json.model }}',
    timeout: 300,
  },
}
```

#### Cursor Parse
```typescript
{
  id: 'cursor-parse',
  name: 'Parse Response',
  type: 'n8n-nodes-custom.cursorParse',
  typeVersion: 1,
  position: [1120, 300],
  parameters: {
    outputFormat: 'markdown',
  },
}
```

#### Cursor Validate
```typescript
{
  id: 'cursor-validate',
  name: 'Validate Response',
  type: 'n8n-nodes-custom.cursorValidate',
  typeVersion: 1,
  position: [1340, 300],
  parameters: {
    validationRules: {
      rules: [
        {
          type: 'contains',
          value: 'security',
        },
        {
          type: 'minLength',
          value: 100,
        },
      ],
    },
  },
}
```

### 4. Output Nodes

#### Response Node
```typescript
{
  id: 'response',
  name: 'Response',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1,
  position: [1560, 300],
  parameters: {
    respondWith: 'json',
    responseBody: '={{ $json }}',
  },
}
```

## 🔗 Node Connections

### Basic Connections
```typescript
connections: {
  'webhook-trigger': {
    main: [
      [
        {
          node: 'extract-input',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
  'extract-input': {
    main: [
      [
        {
          node: 'cursor-execute',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
  'cursor-execute': {
    main: [
      [
        {
          node: 'cursor-parse',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
  'cursor-parse': {
    main: [
      [
        {
          node: 'cursor-validate',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
  'cursor-validate': {
    main: [
      [
        {
          node: 'response',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
}
```

### Conditional Connections
```typescript
connections: {
  'cursor-validate': {
    main: [
      [
        {
          node: 'success-response',
          type: 'main',
          index: 0,
        },
      ],
    ],
    error: [
      [
        {
          node: 'error-response',
          type: 'main',
          index: 0,
        },
      ],
    ],
  },
}
```

## 📋 Workflow Definitions

### 1. Code Review Workflow

#### Purpose
Automated code review with AI feedback, security analysis, and best practice recommendations.

#### Features
- Security vulnerability detection
- Code quality analysis
- Performance optimization suggestions
- Best practice recommendations
- Automated PR comments

#### Usage
```bash
# Run code review workflow
task workflows:run-workflow --name="code-review" --prompt="Review this React component"

# With specific parameters
task workflows:run-workflow --name="code-review" --prompt="Review this code" --projectPath="/path/to/project" --model="claude-4-sonnet"
```

#### Input Parameters
```typescript
interface CodeReviewInput {
  prompt: string;           // Review prompt
  projectPath: string;      // Project directory path
  model?: string;           // AI model (default: claude-4-sonnet)
  branch?: string;          // Git branch (default: main)
  files?: string[];         // Specific files to review
}
```

#### Output Format
```typescript
interface CodeReviewOutput {
  success: boolean;
  review: {
    summary: string;
    security: string[];
    quality: string[];
    performance: string[];
    bestPractices: string[];
    recommendations: string[];
  };
  metadata: {
    model: string;
    executionTime: number;
    filesReviewed: number;
  };
}
```

### 2. Refactoring Workflow

#### Purpose
Batch code modernization, optimization, and architectural improvements.

#### Features
- Legacy code modernization
- Performance optimization
- Architectural improvements
- Code style standardization
- Dependency updates

#### Usage
```bash
# Run refactoring workflow
task workflows:run-workflow --name="refactoring" --prompt="Refactor this legacy code"

# With specific focus
task workflows:run-workflow --name="refactoring" --prompt="Modernize this JavaScript code to use ES6+ features"
```

#### Input Parameters
```typescript
interface RefactoringInput {
  prompt: string;           // Refactoring prompt
  projectPath: string;      // Project directory path
  model?: string;           // AI model (default: claude-4-sonnet)
  scope?: 'file' | 'module' | 'project'; // Refactoring scope
  preserveBehavior?: boolean; // Preserve existing behavior
}
```

#### Output Format
```typescript
interface RefactoringOutput {
  success: boolean;
  refactoring: {
    summary: string;
    changes: {
      file: string;
      original: string;
      refactored: string;
      explanation: string;
    }[];
    improvements: string[];
    risks: string[];
  };
  metadata: {
    model: string;
    executionTime: number;
    filesModified: number;
  };
}
```

### 3. AI Testing Workflow

#### Purpose
Generate comprehensive test suites with coverage reports and edge case testing.

#### Features
- Unit test generation
- Integration test creation
- Edge case testing
- Coverage analysis
- Test optimization

#### Usage
```bash
# Run AI testing workflow
task workflows:run-workflow --name="ai-testing" --prompt="Generate tests for this function"

# With specific test type
task workflows:run-workflow --name="ai-testing" --prompt="Generate integration tests for this API"
```

#### Input Parameters
```typescript
interface AITestingInput {
  prompt: string;           // Testing prompt
  projectPath: string;      // Project directory path
  model?: string;           // AI model (default: claude-4-sonnet)
  testType?: 'unit' | 'integration' | 'e2e'; // Test type
  framework?: string;       // Testing framework
}
```

#### Output Format
```typescript
interface AITestingOutput {
  success: boolean;
  tests: {
    summary: string;
    testFiles: {
      file: string;
      content: string;
      type: string;
      coverage: number;
    }[];
    edgeCases: string[];
    recommendations: string[];
  };
  metadata: {
    model: string;
    executionTime: number;
    testsGenerated: number;
  };
}
```

### 4. Documentation Workflow

#### Purpose
Auto-updating READMEs, API documentation, and code comments.

#### Features
- README generation
- API documentation
- Code comments
- Architecture diagrams
- Usage examples

#### Usage
```bash
# Run documentation workflow
task workflows:run-workflow --name="documentation" --prompt="Document this API"

# With specific format
task workflows:run-workflow --name="documentation" --prompt="Generate README for this project"
```

#### Input Parameters
```typescript
interface DocumentationInput {
  prompt: string;           // Documentation prompt
  projectPath: string;      // Project directory path
  model?: string;           // AI model (default: claude-4-sonnet)
  format?: 'markdown' | 'html' | 'pdf'; // Output format
  scope?: 'file' | 'module' | 'project'; // Documentation scope
}
```

#### Output Format
```typescript
interface DocumentationOutput {
  success: boolean;
  documentation: {
    summary: string;
    files: {
      file: string;
      content: string;
      type: string;
    }[];
    diagrams: string[];
    examples: string[];
  };
  metadata: {
    model: string;
    executionTime: number;
    filesGenerated: number;
  };
}
```

### 5. Bug Fixes Workflow

#### Purpose
Intelligent debugging, error analysis, and automated patch generation.

#### Features
- Error analysis
- Root cause identification
- Patch generation
- Regression testing
- Performance impact analysis

#### Usage
```bash
# Run bug fixes workflow
task workflows:run-workflow --name="bug-fixes" --prompt="Fix this error"

# With specific error
task workflows:run-workflow --name="bug-fixes" --prompt="Fix this memory leak in the React component"
```

#### Input Parameters
```typescript
interface BugFixesInput {
  prompt: string;           // Bug fix prompt
  projectPath: string;      // Project directory path
  model?: string;           // AI model (default: claude-4-sonnet)
  errorLogs?: string;       // Error logs
  reproductionSteps?: string; // Steps to reproduce
}
```

#### Output Format
```typescript
interface BugFixesOutput {
  success: boolean;
  fixes: {
    summary: string;
    rootCause: string;
    patches: {
      file: string;
      original: string;
      fixed: string;
      explanation: string;
    }[];
    tests: string[];
    risks: string[];
  };
  metadata: {
    model: string;
    executionTime: number;
    filesModified: number;
  };
}
```

## 🛠 Development Workflow

### Creating a New Workflow

#### 1. Create Workflow File
```bash
# Create new workflow file
touch src/workflow-definitions/workflows/definitions/my-workflow.ts
```

#### 2. Define Workflow Structure
```typescript
import { WorkflowDefinition } from '../../workflow-engine/types/workflow';

export const myWorkflow: WorkflowDefinition = {
  id: 'my-workflow',
  name: 'My Workflow',
  description: 'Description of what this workflow does',
  version: '1.0.0',
  tags: ['ai', 'development'],
  active: true,
  
  nodes: [
    // Define your nodes here
  ],
  
  connections: {
    // Define your connections here
  },
  
  settings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
    saveManualExecutions: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    timezone: 'UTC',
  },
};
```

#### 3. Register Workflow
Add to `src/workflow-definitions/workflows/definitions/index.ts`:
```typescript
export { myWorkflow } from './my-workflow';
```

### Hot Reload Development

#### Start Development Mode
```bash
# Start with hot reload
task development:dev

# Watch workflow changes
task development:watch-workflows
```

#### Workflow Changes
- **Automatic Reload**: Workflow changes are automatically detected
- **Type Safety**: TypeScript compilation ensures type safety
- **Error Reporting**: Compilation errors are displayed in real-time

### Testing Workflows

#### Manual Testing
```bash
# Test specific workflow
task workflows:run-workflow --name="my-workflow" --prompt="Test prompt"

# Test with parameters
task workflows:run-workflow --name="my-workflow" --prompt="Test" --projectPath="/path/to/project"
```

#### Automated Testing
```typescript
// Create test file
// tests/workflows/my-workflow.test.ts
import { myWorkflow } from '../../src/workflow-definitions/workflows/definitions/my-workflow';

describe('My Workflow', () => {
  it('should have valid structure', () => {
    expect(myWorkflow.id).toBe('my-workflow');
    expect(myWorkflow.nodes).toBeDefined();
    expect(myWorkflow.connections).toBeDefined();
  });
});
```

## 🔧 Advanced Features

### Error Handling

#### Try-Catch Nodes
```typescript
{
  id: 'error-handler',
  name: 'Error Handler',
  type: 'n8n-nodes-base.if',
  typeVersion: 2,
  position: [1120, 300],
  parameters: {
    conditions: {
      string: [
        {
          value1: '={{ $json.success }}',
          operation: 'equal',
          value2: 'false',
        },
      ],
    },
  },
}
```

#### Error Response
```typescript
{
  id: 'error-response',
  name: 'Error Response',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1,
  position: [1340, 400],
  parameters: {
    respondWith: 'json',
    responseBody: '={{ { error: $json.error, message: "Workflow execution failed" } }}',
  },
}
```

### Data Transformation

#### Complex Data Processing
```typescript
{
  id: 'process-data',
  name: 'Process Data',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [680, 300],
  parameters: {
    mode: 'runOnceForAllItems',
    jsCode: `
      const inputData = $input.all();
      const processedData = inputData.map(item => {
        // Complex data processing logic
        return {
          json: {
            ...item.json,
            processed: true,
            timestamp: new Date().toISOString(),
          }
        };
      });
      
      return processedData;
    `,
  },
}
```

### Conditional Logic

#### If-Else Conditions
```typescript
{
  id: 'check-validity',
  name: 'Check Validity',
  type: 'n8n-nodes-base.if',
  typeVersion: 2,
  position: [900, 300],
  parameters: {
    conditions: {
      string: [
        {
          value1: '={{ $json.valid }}',
          operation: 'equal',
          value2: 'true',
        },
      ],
    },
  },
}
```

## 📊 Monitoring and Debugging

### Workflow Execution

#### View Execution Logs
```bash
# View N8N logs
task n8n:logs

# View specific workflow logs
task n8n:logs | grep "my-workflow"
```

#### Execution Status
```bash
# Check workflow status
task workflows:list-workflows

# Check N8N UI
task ui
```

### Performance Monitoring

#### Execution Metrics
- **Execution Time**: Track workflow execution duration
- **Success Rate**: Monitor workflow success/failure rates
- **Resource Usage**: Monitor CPU and memory usage
- **Error Rates**: Track error frequency and types

#### Optimization Tips
- **Node Optimization**: Minimize unnecessary nodes
- **Data Processing**: Optimize data transformation logic
- **Error Handling**: Implement efficient error handling
- **Resource Management**: Monitor and optimize resource usage

## 🚨 Troubleshooting

### Common Issues

#### Workflow Not Loading
```bash
# Check TypeScript compilation
npm run build

# Check workflow syntax
task workflows:list-workflows

# Check N8N logs
task n8n:logs
```

#### Node Connection Issues
```bash
# Verify node connections
# Check node IDs match in connections
# Ensure proper connection syntax
```

#### Execution Failures
```bash
# Check node parameters
# Verify input data format
# Check error logs
task n8n:logs | grep "ERROR"
```

### Debug Mode
```bash
# Enable debug logging
export N8N_LOG_LEVEL=debug
task n8n:logs
```

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Cursor CLI Integration](05-cursor-cli.md)** - AI assistant configuration
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07