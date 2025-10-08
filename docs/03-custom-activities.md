# Custom Activities (N8N Nodes)

> **Complete guide to Agent Flow's custom N8N activities for Cursor CLI integration**

Agent Flow includes three custom N8N activities that provide seamless integration with Cursor CLI, enabling AI-powered workflows within N8N's visual interface.

## 🎯 Overview

### Available Activities
- **Cursor Execute** - Execute Cursor CLI commands with full context
- **Cursor Parse** - Parse and structure Cursor CLI responses
- **Cursor Validate** - Validate responses and extract insights

### Integration Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   N8N Workflow  │───▶│ Custom Activities│───▶│   Cursor CLI    │
│                 │    │                  │    │                 │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │ Trigger     ││    │ │ Cursor       │ │    │ │ AI Models   │ │
│  │ Node        ││    │ │ Execute      │ │    │ │ (Claude,    │ │
│  └─────────────┘│    │ └──────────────┘ │    │ │  GPT-4)     │ │
│        │        │    │        │         │    │ └─────────────┘ │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│  │ Data        ││    │ │ Cursor       │ │    │ │ Code        │ │
│  │ Processing  ││    │ │ Parse        │ │    │ │ Analysis    │ │
│  └─────────────┘│    │ └──────────────┘ │    │ └─────────────┘ │
│        │        │    │        │         │    │                 │
│  ┌─────────────┐│    │ ┌──────────────┐ │    │                 │
│  │ Output      ││    │ │ Cursor       │ │    │                 │
│  │ Node        ││    │ │ Validate     │ │    │                 │
│  └─────────────┘│    │ └──────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Cursor Execute Activity

### Purpose
Executes Cursor CLI commands with full project context and AI model configuration.

### Configuration

#### Basic Parameters
```json
{
  "prompt": "Review this React component for security issues",
  "projectPath": "/path/to/your/project",
  "model": "claude-4-sonnet",
  "timeout": 300,
  "workingDirectory": "/optional/working/dir"
}
```

#### Parameter Details

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | - | The prompt to send to Cursor CLI |
| `projectPath` | string | ✅ | - | Path to the project directory |
| `model` | options | ❌ | claude-4-sonnet | AI model to use |
| `timeout` | number | ❌ | 300 | Maximum execution time (seconds) |
| `workingDirectory` | string | ❌ | - | Custom working directory (optional) |

#### Available Models
- **Claude 4 Opus** - Most capable, best for complex tasks
- **Claude 4 Sonnet** - Balanced performance and speed
- **Claude 4 Haiku** - Fastest, good for simple tasks
- **GPT-4** - OpenAI's flagship model
- **GPT-4 Turbo** - Faster version of GPT-4

### Usage Examples

#### Code Review
```json
{
  "prompt": "Review this code for security vulnerabilities, performance issues, and best practices",
  "projectPath": "/Users/dev/my-project",
  "model": "claude-4-sonnet",
  "timeout": 600
}
```

#### Refactoring
```json
{
  "prompt": "Refactor this legacy code to use modern JavaScript patterns and improve readability",
  "projectPath": "/Users/dev/legacy-app",
  "model": "claude-4-opus",
  "timeout": 900
}
```

#### Test Generation
```json
{
  "prompt": "Generate comprehensive unit tests for this function with edge cases",
  "projectPath": "/Users/dev/test-project",
  "model": "claude-4-sonnet",
  "timeout": 300
}
```

### Output Format
```json
{
  "success": true,
  "output": "AI-generated response content",
  "prompt": "Original prompt",
  "projectPath": "/path/to/project",
  "model": "claude-4-sonnet",
  "executedAt": "2024-10-07T20:30:00.000Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": "Error message",
  "stderr": "Standard error output",
  "prompt": "Original prompt",
  "projectPath": "/path/to/project",
  "model": "claude-4-sonnet",
  "executedAt": "2024-10-07T20:30:00.000Z"
}
```

## 📝 Cursor Parse Activity

### Purpose
Parses and structures Cursor CLI responses into different formats for further processing.

### Configuration

#### Basic Parameters
```json
{
  "outputFormat": "auto"
}
```

#### Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| `auto` | Automatically detect format | General purpose |
| `json` | Parse as JSON | Structured data |
| `markdown` | Parse as Markdown | Documentation |
| `text` | Plain text | Simple processing |

### Usage Examples

#### Auto-detect Format
```json
{
  "outputFormat": "auto"
}
```

#### Force JSON Parsing
```json
{
  "outputFormat": "json"
}
```

#### Force Markdown Parsing
```json
{
  "outputFormat": "markdown"
}
```

### Output Format
```json
{
  "originalOutput": "Raw Cursor CLI response",
  "parsedOutput": "Structured/parsed content",
  "format": "detected-or-specified-format",
  "metadata": {
    "parsedAt": "2024-10-07T20:30:00.000Z",
    "confidence": 0.95
  }
}
```

## ✅ Cursor Validate Activity

### Purpose
Validates Cursor CLI responses against configurable rules and extracts insights.

### Configuration

#### Basic Parameters
```json
{
  "validationRules": {
    "rules": [
      {
        "type": "contains",
        "value": "security"
      },
      {
        "type": "minLength",
        "value": 100
      },
      {
        "type": "noErrors",
        "value": true
      }
    ]
  }
}
```

#### Validation Rule Types

| Rule Type | Description | Parameters |
|-----------|-------------|------------|
| `contains` | Check if output contains specific text | `value`: text to search for |
| `minLength` | Minimum output length | `value`: minimum character count |
| `maxLength` | Maximum output length | `value`: maximum character count |
| `regex` | Regex pattern matching | `value`: regex pattern |
| `jsonValid` | Valid JSON format | `value`: true/false |
| `noErrors` | No error keywords | `value`: true/false |

### Usage Examples

#### Security Review Validation
```json
{
  "validationRules": {
    "rules": [
      {
        "type": "contains",
        "value": "security"
      },
      {
        "type": "contains",
        "value": "vulnerability"
      },
      {
        "type": "minLength",
        "value": 200
      }
    ]
  }
}
```

#### Code Quality Validation
```json
{
  "validationRules": {
    "rules": [
      {
        "type": "contains",
        "value": "best practice"
      },
      {
        "type": "contains",
        "value": "performance"
      },
      {
        "type": "noErrors",
        "value": true
      }
    ]
  }
}
```

### Output Format
```json
{
  "valid": true,
  "score": 0.85,
  "rules": [
    {
      "type": "contains",
      "passed": true,
      "message": "Contains required text"
    },
    {
      "type": "minLength",
      "passed": true,
      "message": "Meets minimum length requirement"
    }
  ],
  "insights": [
    "High quality response",
    "Comprehensive analysis provided"
  ],
  "validatedAt": "2024-10-07T20:30:00.000Z"
}
```

## 🔄 Workflow Integration

### Basic Workflow Pattern
```
Trigger → Cursor Execute → Cursor Parse → Cursor Validate → Output
```

### Advanced Workflow Pattern
```
Trigger → Data Processing → Cursor Execute → Cursor Parse → 
Conditional Logic → Cursor Validate → Output → Notification
```

### Example Workflow: Code Review
```json
{
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "parameters": {}
    },
    {
      "name": "Execute Review",
      "type": "n8n-nodes-custom.cursorExecute",
      "parameters": {
        "prompt": "Review this code for security and quality issues",
        "projectPath": "{{ $json.projectPath }}",
        "model": "claude-4-sonnet"
      }
    },
    {
      "name": "Parse Response",
      "type": "n8n-nodes-custom.cursorParse",
      "parameters": {
        "outputFormat": "markdown"
      }
    },
    {
      "name": "Validate Quality",
      "type": "n8n-nodes-custom.cursorValidate",
      "parameters": {
        "validationRules": {
          "rules": [
            {
              "type": "contains",
              "value": "security"
            },
            {
              "type": "minLength",
              "value": 100
            }
          ]
        }
      }
    }
  ]
}
```

## 🛠 Development

### Building Activities
```bash
# Build all activities
task n8n:build-activities

# Build specific activity
cd src/n8n-nodes/activities
npm run build
```

### Reloading Activities
```bash
# Reload activities in N8N
task n8n:reload-activities
```

### Activity Structure
```
src/n8n-nodes/activities/
├── cursor-execute/
│   ├── description.json    # N8N node definition
│   └── index.js           # Node implementation
├── cursor-parse/
│   ├── description.json
│   └── index.js
├── cursor-validate/
│   ├── description.json
│   └── index.js
├── index.js               # Main entry point
├── package.json           # Dependencies
└── node_modules/          # Installed packages
```

### Creating Custom Activities

#### 1. Create Activity Directory
```bash
mkdir src/n8n-nodes/activities/my-activity
cd src/n8n-nodes/activities/my-activity
```

#### 2. Create Description File
```json
{
  "node": "n8n-nodes-custom.myActivity",
  "nodeType": "n8n-nodes-base.function",
  "displayName": "My Activity",
  "description": "Description of what this activity does",
  "icon": "my-icon.svg",
  "group": ["transform"],
  "version": 1,
  "defaults": {
    "name": "My Activity",
    "color": "#1a73e8"
  },
  "inputs": ["main"],
  "outputs": ["main"],
  "properties": [
    {
      "displayName": "Parameter Name",
      "name": "parameterName",
      "type": "string",
      "required": true,
      "default": "",
      "description": "Parameter description"
    }
  ]
}
```

#### 3. Create Implementation
```javascript
const { IExecuteFunctions } = require('n8n-core');

module.exports = {
  displayName: 'My Activity',
  name: 'myActivity',
  icon: 'file:my-icon.svg',
  group: ['transform'],
  version: 1,
  description: 'Description of what this activity does',
  defaults: {
    name: 'My Activity',
    color: '#1a73e8',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Parameter Name',
      name: 'parameterName',
      type: 'string',
      required: true,
      default: '',
      description: 'Parameter description',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const parameterValue = this.getNodeParameter('parameterName', i) as string;

      // Your activity logic here
      const result = await processData(parameterValue);

      returnData.push({
        json: {
          success: true,
          result: result,
          processedAt: new Date().toISOString(),
        },
      });
    }

    return [returnData];
  },
};
```

#### 4. Register Activity
Add to `src/n8n-nodes/activities/index.js`:
```javascript
module.exports = {
  cursorExecute: require('./cursor-execute'),
  cursorParse: require('./cursor-parse'),
  cursorValidate: require('./cursor-validate'),
  myActivity: require('./my-activity'), // Add your activity
};
```

## 🚨 Troubleshooting

### Common Issues

#### Activity Not Found
```bash
# Check if activities are built
task n8n:build-activities

# Check if activities are loaded
task n8n:reload-activities

# Check N8N logs
task n8n:logs
```

#### Cursor CLI Not Found
```bash
# Check if Cursor CLI is installed
cursor-agent --version

# Check PATH
echo $PATH

# Install Cursor CLI
npm install -g @cursor/cli
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x /usr/local/bin/cursor-agent

# Check Docker permissions
sudo usermod -aG docker $USER
```

#### Timeout Issues
```bash
# Increase timeout in activity configuration
{
  "timeout": 600  // 10 minutes
}

# Check system resources
docker stats
```

### Debug Mode
```bash
# Enable debug logging
export N8N_LOG_LEVEL=debug
task n8n:logs
```

### Testing Activities
```bash
# Test specific activity
task workflows:run-workflow --name="test-cursor-execute"

# Check activity output
task n8n:logs | grep "Cursor Execute"
```

## 📊 Performance Optimization

### Resource Management
- **Timeout Configuration**: Set appropriate timeouts based on task complexity
- **Model Selection**: Choose the right model for the task (Haiku for simple, Opus for complex)
- **Batch Processing**: Process multiple items efficiently

### Caching Strategies
- **Response Caching**: Cache similar responses to reduce API calls
- **Model Caching**: Reuse model instances when possible
- **Result Caching**: Cache parsed and validated results

### Error Handling
- **Retry Logic**: Implement retry mechanisms for transient failures
- **Fallback Models**: Use fallback models when primary model fails
- **Graceful Degradation**: Provide meaningful error messages

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Cursor CLI Integration](05-cursor-cli.md)** - AI assistant configuration
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07