# Code-Defined Workflows

Define N8N workflows as TypeScript code for better maintainability and version control.

## Overview

Instead of creating workflows through the N8N UI, define them as TypeScript code:

- **Version Control** - Track workflow changes in Git
- **Type Safety** - Compile-time validation of workflow structure
- **Reusable Components** - Share workflow patterns across projects
- **Automated Deployment** - Deploy workflows with code changes

## Workflow Structure

### Basic Workflow Definition
```typescript
// workflows/code-review.ts
export const codeReviewWorkflow = {
  id: 'code-review-workflow',
  name: 'AI Code Review',
  description: 'Automated code review using Cursor CLI',
  version: '1.0.0',
  active: true,

  nodes: [
    {
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'code-review',
        httpMethod: 'POST'
      }
    },
    {
      name: 'Execute Cursor',
      type: 'custom-cursor-execute',
      parameters: {
        prompt: 'Review code for security and best practices',
        projectPath: '/path/to/project'
      }
    }
  ],

  connections: {
    'Webhook Trigger': {
      main: [['Execute Cursor']]
    }
  }
};
```

### Node Configuration
Each node specifies:
- **Name** - Human-readable identifier
- **Type** - N8N node type (webhook, executeCommand, etc.)
- **Parameters** - Configuration specific to the node type
- **Position** - UI layout coordinates

### Connections
Define how data flows between nodes:
- **Source Node** - Where data comes from
- **Target Node** - Where data goes to
- **Connection Type** - Main flow, success, or error paths

## Workflow Types

### Code Review Workflows
Automate code quality analysis:
- **Security Reviews** - Check for vulnerabilities
- **Performance Analysis** - Identify optimization opportunities
- **Code Quality** - Enforce best practices and standards
- **Dependency Analysis** - Review third-party package usage

### Refactoring Workflows
Modernize and improve existing code:
- **Code Modernization** - Update to current best practices
- **Performance Optimization** - Improve execution speed
- **Architecture Improvements** - Better code organization
- **Technical Debt Reduction** - Systematic code improvement

### Testing Workflows
Generate and validate test coverage:
- **Unit Test Generation** - Create tests for functions and classes
- **Integration Test Creation** - Test component interactions
- **Test Coverage Analysis** - Identify untested code paths
- **Test Quality Assessment** - Ensure test effectiveness

### Documentation Workflows
Keep documentation current and comprehensive:
- **README Updates** - Auto-update project documentation
- **API Documentation** - Generate API reference docs
- **Changelog Management** - Track and document changes
- **Code Comments** - Add or update inline documentation

## Implementation

### Directory Structure
```
workflows/
├── definitions/
│   ├── code-review.ts       # Code review workflows
│   ├── refactoring.ts       # Refactoring workflows
│   ├── testing.ts          # Testing workflows
│   └── documentation.ts    # Documentation workflows
├── loader/                 # Workflow loading system
└── tests/                  # Workflow tests
```

### Loading System
```typescript
// lib/loader/index.ts
export class WorkflowLoader {
  async loadWorkflows(): Promise<WorkflowLoadResult> {
    // Find and load all workflow files
    // Validate workflow structure
    // Deploy to N8N if configured
    // Return loading results
  }
}
```

### Configuration
```json
{
  "autoLoad": true,
  "watchMode": true,
  "validation": true,
  "deployment": {
    "autoDeploy": true,
    "n8nUrl": "http://localhost:5678"
  }
}
```

## Integration with System

### Development Workflow
```bash
# Start development environment
task serve

# Edit workflow files
# Changes are automatically detected and reloaded

# Test workflows
task run-workflow --name="code-review"
```

### CI/CD Integration
```yaml
# GitHub Actions
name: Deploy Workflows
on:
  push:
    paths: ['workflows/**']

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v3
      - name: Deploy workflows
        run: task build && task reload-workflows
```

### Hot Reload
```bash
# File watching automatically reloads workflows
# Edit workflows/definitions/*.ts
# Changes are detected and deployed instantly
# No manual N8N UI interaction required
```

## Best Practices

### Workflow Design
1. **Single Responsibility** - Each workflow should do one thing well
2. **Error Handling** - Include proper error handling and fallbacks
3. **Input Validation** - Validate all inputs before processing
4. **Logging** - Include meaningful logging for debugging
5. **Testing** - Test workflows with various input scenarios

### Code Organization
1. **Modular Design** - Break complex workflows into smaller, reusable parts
2. **Consistent Naming** - Use clear, descriptive names for nodes and workflows
3. **Documentation** - Include comments explaining complex logic
4. **Version Control** - Use semantic versioning for workflow changes

### Performance
1. **Efficient Prompts** - Use focused, specific AI prompts
2. **Batch Processing** - Process multiple items together when possible
3. **Caching** - Cache results for frequently used operations
4. **Resource Limits** - Set appropriate timeouts and resource constraints

## Common Patterns

### Sequential Processing
```typescript
// Process items one by one
connections: {
  'Start': { main: [['Process Item']] },
  'Process Item': { main: [['Check Result']] },
  'Check Result': {
    main: [['Success Handler']],
    error: [['Error Handler']]
  }
}
```

### Parallel Processing
```typescript
// Process multiple items simultaneously
connections: {
  'Start': {
    main: [
      ['Process Item 1'],
      ['Process Item 2'],
      ['Process Item 3']
    ]
  }
}
```

### Conditional Logic
```typescript
// Route based on conditions
connections: {
  'Check Condition': {
    main: [
      ['True Path', 'main'],
      ['False Path', 'main']
    ]
  }
}
```

## Troubleshooting

### Workflow Not Loading
```bash
# Check file syntax
npx tsc --noEmit workflows/definitions/*.ts

# Validate workflow structure
npm run validate:workflows

# Check N8N logs
task logs
```

### Execution Errors
```bash
# Enable debug logging
N8N_LOG_LEVEL=debug task serve

# Check workflow execution logs
task run-workflow --name="debug-workflow"

# Verify node configurations
# Check parameter values and connections
```

### Performance Issues
```bash
# Monitor execution times
task run-workflow --name="performance-test"

# Optimize prompts
# Reduce prompt complexity
# Use more specific instructions

# Check resource usage
docker stats
```

## Advanced Features

### Custom Node Types
Extend N8N with project-specific node types for specialized operations.

### Workflow Templates
Create reusable workflow templates for common automation patterns.

### Integration Testing
Test complete workflows with realistic data and scenarios.

### Performance Monitoring
Track workflow execution metrics and identify optimization opportunities.

This code-defined workflow system provides a robust, maintainable approach to N8N workflow management, enabling complex automation scenarios with proper version control, testing, and deployment capabilities.
