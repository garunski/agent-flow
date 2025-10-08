# Cursor CLI Integration

> **Complete guide to integrating Cursor CLI with Agent Flow workflows**

Cursor CLI is the command-line interface for Cursor's AI coding assistant, providing powerful AI capabilities for code analysis, generation, and modification. Agent Flow integrates Cursor CLI to enable AI-powered workflows within N8N.

## 🎯 Overview

### What is Cursor CLI?
Cursor CLI is a command-line tool that provides access to Cursor's AI models (Claude, GPT-4) for code analysis, generation, and modification. It's designed to work with your existing codebase and development workflow.

### Integration Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Agent Flow    │───▶│  Cursor CLI      │───▶│   AI Models     │
│   Workflows     │    │  Integration     │    │                 │
│                 │    │                  │    │ ┌─────────────┐ │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ │ Claude 4    │ │
│  │ N8N         ││    │ │ Command      │ │    │ │ Opus        │ │
│  │ Activities  ││    │ │ Execution    │ │    │ └─────────────┘ │
│  └─────────────┘│    │ └──────────────┘ │    │ ┌─────────────┐ │
│        │        │    │        │         │    │ │ Claude 4    │ │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ │ Sonnet      │ │
│  │ Workflow    ││    │ │ Response     │ │    │ └─────────────┘ │
│  │ Engine      ││    │ │ Processing   │ │    │ ┌─────────────┐ │
│  └─────────────┘│    │ └──────────────┘ │    │ │ GPT-4       │ │
└─────────────────┘    └──────────────────┘    │ └─────────────┘ │
                                               └─────────────────┘
```

## 🚀 Installation and Setup

### Prerequisites
- **Node.js 18+** - Runtime environment
- **npm or yarn** - Package manager
- **Cursor Account** - Subscription required

### Installation

#### Global Installation
```bash
# Install Cursor CLI globally
npm install -g @cursor/cli

# Verify installation
cursor-agent --version
```

#### Local Installation
```bash
# Install in project directory
npm install @cursor/cli

# Use via npx
npx cursor-agent --version
```

### Authentication

#### API Key Setup
```bash
# Set API key environment variable
export CURSOR_API_KEY="your_cursor_api_key_here"

# Or add to .env file
echo "CURSOR_API_KEY=your_cursor_api_key_here" >> .env
```

#### API Key Configuration
1. **Get API Key**: Visit [Cursor Dashboard](https://cursor.sh/dashboard)
2. **Generate Key**: Create a new API key
3. **Set Environment**: Add to your environment variables
4. **Test Connection**: Run `cursor-agent --version`

### Configuration

#### Environment Variables
```bash
# Required
CURSOR_API_KEY=your_cursor_api_key_here

# Optional
CURSOR_MODEL=claude-4-sonnet
CURSOR_TIMEOUT=300
CURSOR_MAX_TOKENS=4000
CURSOR_TEMPERATURE=0.7
```

#### Configuration File
```json
// .cursorrc
{
  "apiKey": "your_cursor_api_key_here",
  "defaultModel": "claude-4-sonnet",
  "timeout": 300,
  "maxTokens": 4000,
  "temperature": 0.7
}
```

## 🤖 Available Models

### Claude Models

#### Claude 4 Opus
- **Best for**: Complex reasoning, code analysis, architecture decisions
- **Strengths**: Most capable, best understanding of context
- **Use Cases**: Code reviews, architectural refactoring, complex problem solving
- **Cost**: Highest

#### Claude 4 Sonnet
- **Best for**: Balanced performance and speed
- **Strengths**: Good balance of capability and efficiency
- **Use Cases**: General development tasks, code generation, debugging
- **Cost**: Medium

#### Claude 4 Haiku
- **Best for**: Simple tasks, quick responses
- **Strengths**: Fastest, most cost-effective
- **Use Cases**: Simple code generation, quick fixes, basic analysis
- **Cost**: Lowest

### GPT Models

#### GPT-4
- **Best for**: General purpose AI tasks
- **Strengths**: Good general knowledge, code understanding
- **Use Cases**: Code generation, documentation, general analysis
- **Cost**: Medium

#### GPT-4 Turbo
- **Best for**: Fast responses with good quality
- **Strengths**: Faster than GPT-4, good quality
- **Use Cases**: Quick iterations, rapid prototyping
- **Cost**: Medium

## 🔧 Command Reference

### Basic Commands

#### Chat Command
```bash
# Basic chat
cursor-agent chat "Your prompt here"

# With specific model
cursor-agent chat "Your prompt here" --model claude-4-sonnet

# With timeout
cursor-agent chat "Your prompt here" --timeout 600

# With project context
cursor-agent chat "Your prompt here" --project /path/to/project
```

#### Code Analysis
```bash
# Analyze specific file
cursor-agent analyze /path/to/file.js

# Analyze entire project
cursor-agent analyze /path/to/project --recursive

# Analyze with specific focus
cursor-agent analyze /path/to/project --focus security
```

#### Code Generation
```bash
# Generate code
cursor-agent generate "Create a React component for user login"

# Generate with context
cursor-agent generate "Create a React component for user login" --context /path/to/project

# Generate tests
cursor-agent generate "Generate unit tests for this function" --file /path/to/file.js
```

### Advanced Commands

#### Interactive Mode
```bash
# Start interactive session
cursor-agent interactive

# Interactive with project context
cursor-agent interactive --project /path/to/project
```

#### Batch Processing
```bash
# Process multiple files
cursor-agent batch --input /path/to/files --prompt "Review these files"

# Process with different models
cursor-agent batch --input /path/to/files --model claude-4-sonnet --prompt "Review these files"
```

#### Configuration Commands
```bash
# Show current configuration
cursor-agent config

# Set configuration
cursor-agent config set model claude-4-sonnet
cursor-agent config set timeout 600

# Reset configuration
cursor-agent config reset
```

## 🔌 Agent Flow Integration

### Custom Activities

#### Cursor Execute Activity
```typescript
// N8N node configuration
{
  id: 'cursor-execute',
  name: 'Execute Cursor CLI',
  type: 'n8n-nodes-custom.cursorExecute',
  parameters: {
    prompt: '={{ $json.prompt }}',
    projectPath: '={{ $json.projectPath }}',
    model: '={{ $json.model }}',
    timeout: 300,
  },
}
```

#### Cursor Parse Activity
```typescript
// N8N node configuration
{
  id: 'cursor-parse',
  name: 'Parse Response',
  type: 'n8n-nodes-custom.cursorParse',
  parameters: {
    outputFormat: 'markdown',
  },
}
```

#### Cursor Validate Activity
```typescript
// N8N node configuration
{
  id: 'cursor-validate',
  name: 'Validate Response',
  type: 'n8n-nodes-custom.cursorValidate',
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

### Workflow Integration

#### Code Review Workflow
```typescript
// Workflow definition
export const codeReviewWorkflow: WorkflowDefinition = {
  id: 'code-review-workflow',
  name: 'AI Code Review',
  nodes: [
    {
      id: 'cursor-execute',
      name: 'Execute Code Review',
      type: 'n8n-nodes-custom.cursorExecute',
      parameters: {
        prompt: 'Review this code for security issues, performance problems, and best practices',
        projectPath: '={{ $json.projectPath }}',
        model: 'claude-4-sonnet',
        timeout: 600,
      },
    },
    // ... other nodes
  ],
  // ... connections and settings
};
```

#### Refactoring Workflow
```typescript
// Workflow definition
export const refactoringWorkflow: WorkflowDefinition = {
  id: 'refactoring-workflow',
  name: 'AI Refactoring',
  nodes: [
    {
      id: 'cursor-execute',
      name: 'Execute Refactoring',
      type: 'n8n-nodes-custom.cursorExecute',
      parameters: {
        prompt: 'Refactor this code to use modern patterns and improve readability',
        projectPath: '={{ $json.projectPath }}',
        model: 'claude-4-opus',
        timeout: 900,
      },
    },
    // ... other nodes
  ],
  // ... connections and settings
};
```

## 🎯 Use Cases

### Code Review
```bash
# Review specific file
cursor-agent chat "Review this React component for security issues" --file src/components/Login.js

# Review entire project
cursor-agent chat "Review this project for security vulnerabilities" --project /path/to/project

# Review with specific focus
cursor-agent chat "Review this code for performance issues" --file src/utils/helpers.js
```

### Code Generation
```bash
# Generate component
cursor-agent generate "Create a React component for user profile" --context /path/to/project

# Generate API endpoint
cursor-agent generate "Create a REST API endpoint for user authentication" --context /path/to/project

# Generate tests
cursor-agent generate "Generate unit tests for this function" --file src/utils/helpers.js
```

### Refactoring
```bash
# Refactor specific file
cursor-agent chat "Refactor this code to use modern JavaScript patterns" --file src/legacy.js

# Refactor entire module
cursor-agent chat "Refactor this module to improve performance" --project /path/to/module

# Refactor with specific goals
cursor-agent chat "Refactor this code to be more maintainable" --file src/components/ComplexComponent.js
```

### Documentation
```bash
# Generate documentation
cursor-agent generate "Generate README for this project" --context /path/to/project

# Generate API docs
cursor-agent generate "Generate API documentation for this module" --file src/api/routes.js

# Generate code comments
cursor-agent chat "Add comprehensive comments to this code" --file src/utils/helpers.js
```

### Bug Fixing
```bash
# Fix specific bug
cursor-agent chat "Fix this memory leak in the React component" --file src/components/DataTable.js

# Debug error
cursor-agent chat "Debug this error and provide a fix" --file src/utils/errorHandler.js

# Fix performance issue
cursor-agent chat "Fix the performance issue in this function" --file src/utils/processData.js
```

## ⚙️ Configuration Options

### Model Selection

#### For Code Review
```bash
# Use Claude 4 Sonnet for balanced performance
cursor-agent chat "Review this code" --model claude-4-sonnet

# Use Claude 4 Opus for complex analysis
cursor-agent chat "Review this complex architecture" --model claude-4-opus
```

#### For Code Generation
```bash
# Use Claude 4 Sonnet for general generation
cursor-agent generate "Create a React component" --model claude-4-sonnet

# Use GPT-4 for specific patterns
cursor-agent generate "Create a Python Flask API" --model gpt-4
```

#### For Refactoring
```bash
# Use Claude 4 Opus for complex refactoring
cursor-agent chat "Refactor this legacy code" --model claude-4-opus

# Use Claude 4 Sonnet for simple refactoring
cursor-agent chat "Refactor this function" --model claude-4-sonnet
```

### Timeout Configuration

#### Short Tasks (1-5 minutes)
```bash
cursor-agent chat "Quick code review" --timeout 300
```

#### Medium Tasks (5-15 minutes)
```bash
cursor-agent chat "Comprehensive code analysis" --timeout 900
```

#### Long Tasks (15+ minutes)
```bash
cursor-agent chat "Complex refactoring" --timeout 1800
```

### Project Context

#### Single File
```bash
cursor-agent chat "Review this file" --file src/components/Button.js
```

#### Multiple Files
```bash
cursor-agent chat "Review these files" --files src/components/*.js
```

#### Entire Project
```bash
cursor-agent chat "Review this project" --project /path/to/project
```

## 🚨 Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Check API key
echo $CURSOR_API_KEY

# Test connection
cursor-agent --version

# Re-authenticate
cursor-agent auth login
```

#### Model Not Found
```bash
# List available models
cursor-agent models list

# Check model name
cursor-agent chat "Test" --model claude-4-sonnet
```

#### Timeout Issues
```bash
# Increase timeout
cursor-agent chat "Complex task" --timeout 1800

# Check system resources
top
htop
```

#### Permission Issues
```bash
# Check file permissions
ls -la /path/to/project

# Fix permissions
chmod -R 755 /path/to/project
```

### Debug Mode
```bash
# Enable verbose logging
cursor-agent chat "Test" --verbose

# Enable debug mode
export CURSOR_DEBUG=true
cursor-agent chat "Test"
```

### Performance Issues

#### Slow Responses
```bash
# Use faster model
cursor-agent chat "Quick task" --model claude-4-haiku

# Reduce context
cursor-agent chat "Task" --file specific-file.js
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Reduce batch size
cursor-agent batch --input /path/to/files --batch-size 5
```

## 📊 Performance Optimization

### Model Selection Strategy

#### Task Complexity vs Model
- **Simple Tasks**: Claude 4 Haiku (fast, cheap)
- **Medium Tasks**: Claude 4 Sonnet (balanced)
- **Complex Tasks**: Claude 4 Opus (most capable)

#### Response Time vs Quality
- **Quick Iterations**: GPT-4 Turbo
- **High Quality**: Claude 4 Opus
- **Balanced**: Claude 4 Sonnet

### Caching Strategies

#### Response Caching
```bash
# Enable response caching
cursor-agent chat "Task" --cache

# Clear cache
cursor-agent cache clear
```

#### Model Caching
```bash
# Use model caching
cursor-agent chat "Task" --model claude-4-sonnet --cache-model
```

### Resource Management

#### Memory Optimization
```bash
# Limit memory usage
cursor-agent chat "Task" --max-memory 2GB

# Process in batches
cursor-agent batch --input /path/to/files --batch-size 10
```

#### CPU Optimization
```bash
# Limit CPU usage
cursor-agent chat "Task" --max-cpu 50

# Use async processing
cursor-agent chat "Task" --async
```

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

### External Resources
- **[Cursor CLI Documentation](https://cursor.sh/docs)** - Official Cursor CLI docs
- **[Claude API Documentation](https://docs.anthropic.com/)** - Claude API reference
- **[OpenAI API Documentation](https://platform.openai.com/docs)** - OpenAI API reference

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07