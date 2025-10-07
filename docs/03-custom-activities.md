# Custom N8N Activities

Comprehensive custom nodes for seamless Cursor CLI integration with N8N workflows.

## Overview

Custom activities provide a complete integration layer between N8N workflows and Cursor CLI:

- **CursorExecute** - Execute Cursor CLI commands with full context management
- **CursorParse** - Parse and structure Cursor CLI responses
- **CursorValidate** - Validate responses and extract actionable insights
- **CursorWebhook** - Handle webhook responses from Cursor operations
- **CursorFile** - File operations for Cursor-generated content
- **CursorGit** - Git operations integrated with Cursor workflows

## Project Structure

```
activities/
├── package.json                    # Dependencies and scripts
├── cursor-execute/
│   ├── index.js                   # Main activity implementation
│   ├── description.json           # N8N node description
│   └── test.js                    # Unit tests
├── cursor-parse/
│   ├── index.js
│   └── description.json
├── cursor-validate/
│   ├── index.js
│   └── description.json
├── cursor-webhook/
│   ├── index.js
│   └── description.json
├── cursor-file/
│   ├── index.js
│   └── description.json
└── cursor-git/
    ├── index.js
    └── description.json
```

## Package Configuration

**activities/package.json:**
```json
{
  "name": "n8n-custom-activities",
  "version": "1.0.0",
  "description": "Custom N8N activities for Cursor CLI integration",
  "main": "index.js",
  "scripts": {
    "build": "n8n-node-dev build",
    "dev": "n8n-node-dev dev",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "n8n-core": "^0.155.0",
    "n8n-workflow": "^0.155.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "simple-git": "^3.19.0",
    "fs-extra": "^11.1.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "eslint": "^8.40.0",
    "jest": "^29.5.0",
    "n8n-node-dev": "^0.155.0",
    "prettier": "^2.8.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Activity Implementations

### 1. CursorExecute Activity

**activities/cursor-execute/index.js:**
```javascript
const { IExecuteFunctions } = require('n8n-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  displayName: 'Cursor Execute',
  name: 'cursorExecute',
  icon: 'file:cursor.svg',
  group: ['transform'],
  version: 1,
  description: 'Execute Cursor CLI commands with full context',
  defaults: {
    name: 'Cursor Execute',
    color: '#1a73e8',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Prompt',
      name: 'prompt',
      type: 'string',
      required: true,
      default: '',
      description: 'The prompt to send to Cursor CLI',
      typeOptions: {
        rows: 4,
      },
    },
    {
      displayName: 'Project Path',
      name: 'projectPath',
      type: 'string',
      required: true,
      default: '',
      description: 'Path to the project directory',
      placeholder: '/path/to/project',
    },
    {
      displayName: 'Model',
      name: 'model',
      type: 'options',
      options: [
        { name: 'Claude 4 Opus', value: 'claude-4-opus' },
        { name: 'Claude 4 Sonnet', value: 'claude-4-sonnet' },
        { name: 'Claude 4 Haiku', value: 'claude-4-haiku' },
        { name: 'GPT-4', value: 'gpt-4' },
        { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      ],
      default: 'claude-4-sonnet',
      description: 'AI model to use for the request',
    },
    {
      displayName: 'Timeout (seconds)',
      name: 'timeout',
      type: 'number',
      default: 300,
      description: 'Maximum execution time in seconds',
    },
    {
      displayName: 'Working Directory',
      name: 'workingDirectory',
      type: 'string',
      default: '',
      description: 'Custom working directory (optional)',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const prompt = this.getNodeParameter('prompt', i) as string;
      const projectPath = this.getNodeParameter('projectPath', i) as string;
      const model = this.getNodeParameter('model', i) as string;
      const timeout = this.getNodeParameter('timeout', i) as number;
      const workingDirectory = this.getNodeParameter('workingDirectory', i) as string;

      // Validate project path exists
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project path does not exist: ${projectPath}`);
      }

      // Prepare command
      const command = `cd "${projectPath}" && cursor-agent chat "${prompt}" --model ${model}`;

      try {
        // Execute Cursor CLI command
        const output = execSync(command, {
          encoding: 'utf8',
          timeout: timeout * 1000,
          cwd: workingDirectory || projectPath,
          env: {
            ...process.env,
            CURSOR_MODEL: model,
            CURSOR_TIMEOUT: timeout.toString(),
          },
        });

        returnData.push({
          json: {
            success: true,
            output: output.trim(),
            prompt,
            projectPath,
            model,
            executedAt: new Date().toISOString(),
          },
        });

      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            stderr: error.stderr,
            prompt,
            projectPath,
            model,
            executedAt: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  },
};
```

**activities/cursor-execute/description.json:**
```json
{
  "node": "n8n-nodes-custom.cursorExecute",
  "nodeType": "n8n-nodes-base.function",
  "displayName": "Cursor Execute",
  "description": "Execute Cursor CLI commands",
  "icon": "cursor.svg",
  "group": ["transform"],
  "version": 1,
  "defaults": {
    "name": "Cursor Execute",
    "color": "#1a73e8"
  },
  "inputs": ["main"],
  "outputs": ["main"],
  "properties": [
    {
      "displayName": "Prompt",
      "name": "prompt",
      "type": "string",
      "required": true,
      "default": "",
      "description": "The prompt to send to Cursor CLI"
    }
  ]
}
```

### 2. CursorParse Activity

**activities/cursor-parse/index.js:**
```javascript
const { IExecuteFunctions } = require('n8n-core');
const cheerio = require('cheerio');

module.exports = {
  displayName: 'Cursor Parse',
  name: 'cursorParse',
  icon: 'file:text.svg',
  group: ['transform'],
  version: 1,
  description: 'Parse and structure Cursor CLI responses',
  defaults: {
    name: 'Cursor Parse',
    color: '#ff6b35',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Output Format',
      name: 'outputFormat',
      type: 'options',
      options: [
        { name: 'JSON', value: 'json' },
        { name: 'Markdown', value: 'markdown' },
        { name: 'Text', value: 'text' },
        { name: 'Auto-detect', value: 'auto' },
      ],
      default: 'auto',
      description: 'Expected output format',
    },
    {
      displayName: 'Extract Code Blocks',
      name: 'extractCodeBlocks',
      type: 'boolean',
      default: true,
      description: 'Extract code blocks from response',
    },
    {
      displayName: 'Extract Suggestions',
      name: 'extractSuggestions',
      type: 'boolean',
      default: true,
      description: 'Extract actionable suggestions',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const rawOutput = items[i].json.output || items[i].json.rawOutput;
      const outputFormat = this.getNodeParameter('outputFormat', i) as string;
      const extractCodeBlocks = this.getNodeParameter('extractCodeBlocks', i) as boolean;
      const extractSuggestions = this.getNodeParameter('extractSuggestions', i) as boolean;

      if (!rawOutput) {
        throw new Error('No output provided for parsing');
      }

      const result = {
        originalOutput: rawOutput,
        parsedOutput: null,
        codeBlocks: [],
        suggestions: [],
        metadata: {},
      };

      // Auto-detect format or use specified format
      const format = outputFormat === 'auto' ? this.detectFormat(rawOutput) : outputFormat;

      switch (format) {
        case 'json':
          result.parsedOutput = this.parseJSON(rawOutput);
          break;
        case 'markdown':
          result.parsedOutput = this.parseMarkdown(rawOutput);
          break;
        case 'text':
        default:
          result.parsedOutput = rawOutput.trim();
          break;
      }

      // Extract code blocks if requested
      if (extractCodeBlocks) {
        result.codeBlocks = this.extractCodeBlocks(rawOutput);
      }

      // Extract suggestions if requested
      if (extractSuggestions) {
        result.suggestions = this.extractSuggestions(rawOutput);
      }

      // Add metadata
      result.metadata = {
        format,
        length: rawOutput.length,
        parsedAt: new Date().toISOString(),
      };

      returnData.push({ json: result });
    }

    return [returnData];
  },

  detectFormat(text) {
    // Simple format detection
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      return 'json';
    }
    if (text.includes('#') || text.includes('**') || text.includes('```')) {
      return 'markdown';
    }
    return 'text';
  },

  parseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return { error: 'Invalid JSON', raw: text };
    }
  },

  parseMarkdown(text) {
    const $ = cheerio.load(text, { decodeEntities: false });

    return {
      title: $('h1').first().text() || null,
      sections: $('h2, h3').map((i, el) => ({
        level: el.name,
        title: $(el).text(),
        content: $(el).nextUntil('h2, h3').text(),
      })).get(),
      codeBlocks: $('pre code').map((i, el) => ({
        language: $(el).attr('class')?.replace('language-', '') || 'text',
        content: $(el).text(),
      })).get(),
    };
  },

  extractCodeBlocks(text) {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        content: match[2].trim(),
        fullMatch: match[0],
      });
    }

    return blocks;
  },

  extractSuggestions(text) {
    // Extract lines that look like suggestions
    const suggestionRegex = /(?:suggest|recommend|consider|should|could):\s*(.+)/gi;
    const suggestions = [];
    let match;

    while ((match = suggestionRegex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }

    return suggestions;
  },
};
```

### 3. CursorValidate Activity

**activities/cursor-validate/index.js:**
```javascript
const { IExecuteFunctions } = require('n8n-core');

module.exports = {
  displayName: 'Cursor Validate',
  name: 'cursorValidate',
  icon: 'file:check.svg',
  group: ['transform'],
  version: 1,
  description: 'Validate Cursor CLI responses and extract insights',
  defaults: {
    name: 'Cursor Validate',
    color: '#00c851',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Validation Rules',
      name: 'validationRules',
      type: 'fixedCollection',
      typeOptions: {
        multipleValues: true,
      },
      default: {},
      options: [
        {
          name: 'rules',
          displayName: 'Rule',
          values: [
            {
              displayName: 'Rule Type',
              name: 'type',
              type: 'options',
              options: [
                { name: 'Contains Text', value: 'contains' },
                { name: 'Min Length', value: 'minLength' },
                { name: 'Max Length', value: 'maxLength' },
                { name: 'Regex Match', value: 'regex' },
                { name: 'JSON Valid', value: 'jsonValid' },
                { name: 'No Errors', value: 'noErrors' },
              ],
              default: 'contains',
            },
            {
              displayName: 'Value',
              name: 'value',
              type: 'string',
              default: '',
              description: 'Value to check against',
            },
          ],
        },
      ],
    },
    {
      displayName: 'Extract Metrics',
      name: 'extractMetrics',
      type: 'boolean',
      default: true,
      description: 'Extract performance and quality metrics',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const output = items[i].json.output || items[i].json.parsedOutput;
      const validationRules = this.getNodeParameter('validationRules', i) as any;
      const extractMetrics = this.getNodeParameter('extractMetrics', i) as boolean;

      if (!output) {
        throw new Error('No output provided for validation');
      }

      const result = {
        isValid: true,
        issues: [],
        confidence: 0.8,
        metrics: {},
        validatedAt: new Date().toISOString(),
      };

      // Apply validation rules
      if (validationRules?.rules) {
        for (const rule of validationRules.rules) {
          const issue = this.validateRule(output, rule);
          if (issue) {
            result.isValid = false;
            result.issues.push(issue);
          }
        }
      }

      // Calculate confidence score
      result.confidence = this.calculateConfidence(output, result.issues);

      // Extract metrics if requested
      if (extractMetrics) {
        result.metrics = this.extractMetrics(output);
      }

      returnData.push({ json: result });
    }

    return [returnData];
  },

  validateRule(output, rule) {
    const { type, value } = rule;

    switch (type) {
      case 'contains':
        if (!output.includes(value)) {
          return `Output does not contain: ${value}`;
        }
        break;

      case 'minLength':
        if (output.length < parseInt(value)) {
          return `Output too short: ${output.length} < ${value}`;
        }
        break;

      case 'maxLength':
        if (output.length > parseInt(value)) {
          return `Output too long: ${output.length} > ${value}`;
        }
        break;

      case 'regex':
        if (!new RegExp(value).test(output)) {
          return `Output does not match regex: ${value}`;
        }
        break;

      case 'jsonValid':
        try {
          JSON.parse(output);
        } catch (error) {
          return `Output is not valid JSON: ${error.message}`;
        }
        break;

      case 'noErrors':
        if (output.includes('error') || output.includes('Error') || output.includes('ERROR')) {
          return 'Output contains error indicators';
        }
        break;
    }

    return null;
  },

  calculateConfidence(output, issues) {
    let confidence = 1.0;

    // Reduce confidence for issues
    confidence -= issues.length * 0.2;

    // Reduce confidence for very short outputs
    if (output.length < 100) {
      confidence -= 0.1;
    }

    // Boost confidence for structured outputs
    if (output.includes('{') && output.includes('}')) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  },

  extractMetrics(output) {
    return {
      wordCount: output.split(/\s+/).length,
      characterCount: output.length,
      lineCount: output.split('\n').length,
      codeBlockCount: (output.match(/```/g) || []).length / 2,
      suggestionCount: (output.match(/(?:suggest|recommend|consider)/gi) || []).length,
    };
  },
};
```

## Development and Testing

### Building Activities

```bash
# Install dependencies
cd activities
npm install

# Build for development
npm run build

# Build for production
npm run build:prod

# Development mode with watch
npm run dev
```

### Testing Activities

**activities/cursor-execute/test.js:**
```javascript
const { execute } = require('./index');

describe('CursorExecute', () => {
  test('should execute basic prompt', async () => {
    const mockContext = {
      getInputData: () => [{ json: {} }],
      getNodeParameter: (name, index) => {
        const params = {
          prompt: 'Test prompt',
          projectPath: '/test/project',
          model: 'claude-4-sonnet',
          timeout: 30,
        };
        return params[name];
      },
    };

    // Mock execSync
    const originalExecSync = require('child_process').execSync;
    require('child_process').execSync = jest.fn(() =>
      'Mock Cursor response'
    );

    const result = await execute.call(mockContext);

    expect(result[0][0].json.success).toBe(true);
    expect(result[0][0].json.output).toBe('Mock Cursor response');

    // Restore original
    require('child_process').execSync = originalExecSync;
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific activity tests
npm test cursor-execute

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Integration with N8N

### Installation in N8N

```bash
# Copy activities to N8N custom nodes directory
cp -r activities ~/.n8n/custom/

# Restart N8N
docker-compose restart n8n

# Verify installation
curl http://localhost:5678/rest/node-types | jq '.nodeTypes[] | select(.name | contains("cursor"))'
```

### Workflow Integration

**Complete Workflow Example:**
```json
{
  "name": "Advanced Cursor Integration",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "cursor-workflow",
        "responseMode": "responseNode"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "prompt": "{{ $json.body.prompt }}",
        "projectPath": "{{ $json.body.projectPath }}",
        "model": "{{ $json.body.model || 'claude-4-sonnet' }}"
      },
      "name": "Execute Cursor",
      "type": "custom-cursor-execute",
      "position": [460, 300]
    },
    {
      "parameters": {
        "outputFormat": "auto",
        "extractCodeBlocks": true,
        "extractSuggestions": true
      },
      "name": "Parse Response",
      "type": "custom-cursor-parse",
      "position": [680, 300]
    },
    {
      "parameters": {
        "validationRules": {
          "rules": [
            {
              "type": "minLength",
              "value": "10"
            },
            {
              "type": "noErrors"
            }
          ]
        },
        "extractMetrics": true
      },
      "name": "Validate Output",
      "type": "custom-cursor-validate",
      "position": [900, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.isValid }}",
              "value2": true
            }
          ]
        }
      },
      "name": "Check Validation",
      "type": "n8n-nodes-base.if",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1340, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": false, \"error\": $json.issues } }}"
      },
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1340, 400]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Execute Cursor",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute Cursor": {
      "main": [
        [
          {
            "node": "Parse Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse Response": {
      "main": [
        [
          {
            "node": "Validate Output",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Validate Output": {
      "main": [
        [
          {
            "node": "Check Validation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Validation": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Advanced Features

### Error Handling and Retry Logic

```javascript
// Enhanced error handling in activities
class CursorActivityError extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.name = 'CursorActivityError';
    this.code = code;
    this.retryable = retryable;
  }
}

// Retry mechanism
async function executeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.retryable && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

### Caching and Performance

```javascript
// Response caching
const responseCache = new Map();

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
    return cached.data;
  }
  return null;
}

function setCachedResponse(key, data) {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Cleanup old entries
  if (responseCache.size > 1000) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}
```

### Configuration Management

**Environment Variables:**
```bash
# Activity configuration
CURSOR_API_KEY=your_api_key
CURSOR_DEFAULT_MODEL=claude-4-sonnet
CURSOR_TIMEOUT=300
CURSOR_CACHE_ENABLED=true
CURSOR_CACHE_TTL=300000

# Activity paths
N8N_CUSTOM_NODES_DIR=~/.n8n/custom
N8N_ACTIVITIES_DIR=./activities

# Development
NODE_ENV=development
DEBUG=cursor-activities:*
```

## Best Practices

1. **Error Handling** - Implement comprehensive error handling with retry logic
2. **Input Validation** - Validate all inputs before processing
3. **Resource Management** - Clean up resources and implement timeouts
4. **Caching** - Cache responses for frequently used prompts
5. **Logging** - Implement structured logging for debugging
6. **Testing** - Write comprehensive tests for all activities
7. **Documentation** - Document all parameters and expected outputs
8. **Version Control** - Version activities and maintain backward compatibility

## Troubleshooting

### Common Issues

**Activity not loading:**
```bash
# Check N8N logs
docker-compose logs n8n | grep -i cursor

# Verify activity files
ls -la ~/.n8n/custom/cursor-execute/

# Test activity directly
node activities/cursor-execute/test.js
```

**Execution timeouts:**
```bash
# Increase timeout in activity
{
  "timeout": 600,  // 10 minutes
  "retryCount": 3
}
```

**Permission errors:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER ~/.n8n/custom/
chmod -R 755 ~/.n8n/custom/
```

This comprehensive custom activities system provides a robust foundation for integrating Cursor CLI with N8N workflows, enabling complex automation scenarios with proper error handling, caching, and extensibility.
