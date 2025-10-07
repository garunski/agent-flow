# Custom N8N Activities

Extend N8N with custom nodes for seamless Cursor CLI integration.

## Overview

Custom activities provide specialized nodes that integrate Cursor CLI functionality directly into N8N workflows:

- **CursorExecute** - Execute AI commands with full project context
- **CursorParse** - Parse and structure AI responses intelligently
- **CursorValidate** - Validate responses and extract quality metrics

## Activity Types

### CursorExecute
Executes Cursor CLI commands within N8N workflows.

**Inputs:**
- **Prompt** - The AI instruction to execute
- **Project Path** - Directory containing the project
- **Model** - AI model to use (Claude 4, GPT-4, etc.)
- **Timeout** - Maximum execution time

**Outputs:**
- **Success** - Whether execution completed successfully
- **Output** - The AI response content
- **Error** - Any error messages if execution failed

**Use Case:** Run code reviews, generate tests, or refactor code directly from N8N workflows.

### CursorParse
Intelligently parses AI responses to extract structured data.

**Inputs:**
- **Raw Output** - The AI response to parse
- **Output Format** - Expected format (JSON, Markdown, Text, Auto-detect)
- **Extract Code Blocks** - Whether to extract code snippets
- **Extract Suggestions** - Whether to extract recommendations

**Outputs:**
- **Parsed Output** - Structured response data
- **Code Blocks** - Extracted code snippets with language detection
- **Suggestions** - Actionable recommendations from the response
- **Metadata** - Parsing statistics and format information

**Use Case:** Process AI responses to extract code, suggestions, and structured data for further workflow steps.

### CursorValidate
Validates AI responses and provides quality metrics.

**Inputs:**
- **Output** - The response to validate
- **Validation Rules** - Custom validation criteria
- **Extract Metrics** - Whether to calculate quality metrics

**Outputs:**
- **Is Valid** - Whether response meets validation criteria
- **Issues** - List of validation failures or concerns
- **Confidence** - Quality confidence score (0-1)
- **Metrics** - Response statistics (word count, code blocks, etc.)

**Use Case:** Ensure AI responses meet quality standards before proceeding with workflow automation.

## Implementation

### Directory Structure
```
activities/
├── cursor-execute/
│   ├── index.js          # Main activity code
│   └── description.json  # N8N node definition
├── cursor-parse/
│   ├── index.js
│   └── description.json
└── cursor-validate/
    ├── index.js
    └── description.json
```

### Installation in N8N
```bash
# Copy activities to N8N custom nodes
cp -r activities ~/.n8n/custom/

# Restart N8N to load new activities
docker-compose restart n8n
```

### Development Setup
```bash
# Install dependencies
cd activities
npm install

# Build activities for development
npm run build

# Activities are now available in N8N UI
```

## Usage in Workflows

### Basic Code Review
```json
{
  "name": "AI Code Review",
  "nodes": [
    {
      "name": "Execute Review",
      "type": "custom-cursor-execute",
      "parameters": {
        "prompt": "Review this code for security vulnerabilities and best practices",
        "projectPath": "/path/to/project",
        "model": "claude-4-sonnet"
      }
    },
    {
      "name": "Parse Response",
      "type": "custom-cursor-parse",
      "parameters": {
        "outputFormat": "auto",
        "extractCodeBlocks": true,
        "extractSuggestions": true
      }
    },
    {
      "name": "Validate Quality",
      "type": "custom-cursor-validate",
      "parameters": {
        "validationRules": {
          "rules": [
            {
              "type": "minLength",
              "value": "100"
            },
            {
              "type": "contains",
              "value": "review"
            }
          ]
        },
        "extractMetrics": true
      }
    }
  ]
}
```

### Advanced Integration
The activities support:
- **Error Handling** - Comprehensive error detection and reporting
- **Response Parsing** - Automatic format detection and structured extraction
- **Quality Validation** - Custom validation rules and confidence scoring
- **Performance Monitoring** - Execution metrics and response analysis

## Integration with System

### Taskfile Integration
```bash
# Build activities via Taskfile
task build-activities

# Test activities
task test-activities
```

### Workflow Integration
Activities work seamlessly with:
- **Webhook Triggers** - API-driven workflow execution
- **File Operations** - Process generated code and documentation
- **Git Integration** - Commit changes and create pull requests
- **Notification Systems** - Slack, email, and GitHub notifications

## Best Practices

1. **Start Simple** - Use basic prompts and gradually add complexity
2. **Validate Responses** - Always validate AI outputs before automation
3. **Handle Errors** - Implement proper error handling in workflows
4. **Monitor Performance** - Track execution times and response quality
5. **Test Thoroughly** - Validate activities work in different scenarios

## Troubleshooting

### Common Issues

**Activity not loading:**
```bash
# Check N8N logs
docker-compose logs n8n | grep -i cursor

# Verify activity files exist
ls -la ~/.n8n/custom/cursor-execute/

# Rebuild and restart
task build-activities && docker-compose restart n8n
```

**Execution timeouts:**
- Increase timeout in activity parameters
- Use smaller, focused prompts
- Consider breaking large tasks into smaller steps

**Permission errors:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER ~/.n8n/custom/
chmod -R 755 ~/.n8n/custom/
```

These custom activities transform N8N into a powerful AI-powered automation platform, enabling complex development workflows with intelligent code analysis and generation capabilities.
