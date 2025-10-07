# Cursor CLI Manual

Direct usage guide for the Cursor AI coding assistant.

## Overview

Cursor CLI is an AI-powered coding assistant that helps with:
- **Code Reviews** - Analyze code for issues and improvements
- **Code Generation** - Create new code and functionality
- **Debugging** - Find and fix bugs in existing code
- **Refactoring** - Improve code structure and performance
- **Documentation** - Generate and update documentation

## Installation

```bash
# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Add to PATH (if needed)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
cursor-agent --version
```

## Basic Usage

### Interactive Mode
```bash
# Start conversational session
cursor-agent

# Example conversation:
> Review this authentication module for security issues
> Generate unit tests for the UserService class
> Refactor the database connection logic
> Exit
```

### Single Commands
```bash
# Code review
cursor-agent chat "Review src/auth.ts for security vulnerabilities"

# Code generation
cursor-agent chat "Create a REST API endpoint for user registration"

# Bug fixing
cursor-agent chat "Find and fix the memory leak in UserService.ts"

# Documentation
cursor-agent chat "Update README.md with recent API changes"
```

## Common Use Cases

### Code Reviews
```bash
# Security review
cursor-agent chat "Review this code for security vulnerabilities and suggest fixes"

# Performance analysis
cursor-agent chat "Analyze this function for performance issues and optimization opportunities"

# Code quality
cursor-agent chat "Review this code for best practices and suggest improvements"
```

### Code Generation
```bash
# New features
cursor-agent chat "Create a user authentication system with JWT tokens"

# API endpoints
cursor-agent chat "Generate REST API endpoints for a blog application"

# Utility functions
cursor-agent chat "Create utility functions for date formatting and validation"
```

### Debugging
```bash
# Error analysis
cursor-agent chat "Debug this error: TypeError: Cannot read property 'map' of undefined"

# Bug hunting
cursor-agent chat "Find the source of the memory leak in this React component"

# Performance issues
cursor-agent chat "Identify why this function is running slowly"
```

### Refactoring
```bash
# Modernization
cursor-agent chat "Refactor this code to use modern JavaScript/TypeScript patterns"

# Performance optimization
cursor-agent chat "Optimize this algorithm for better performance"

# Code organization
cursor-agent chat "Reorganize this file structure following SOLID principles"
```

## Advanced Features

### Custom Commands
Create project-specific commands using MCP (Model Context Protocol):

```javascript
// config/cursor-commands.js
module.exports = {
  commands: {
    '/test': {
      description: 'Run project tests',
      execute: async (args) => {
        // Run test suite
        return 'Tests completed successfully';
      }
    },
    '/deploy': {
      description: 'Deploy current branch',
      execute: async (args) => {
        // Trigger deployment
        return 'Deployment initiated';
      }
    }
  }
};
```

### Model Selection
```bash
# Use specific AI models
cursor-agent chat "Review code" --model claude-4-opus
cursor-agent chat "Generate tests" --model gpt-4
cursor-agent chat "Debug issue" --model claude-4-sonnet
```

### Project Context
```bash
# Set project path
export CURSOR_PROJECT_PATH=/path/to/project

# Run with project context
cursor-agent chat "Review this codebase structure"
```

## Integration with System

### Taskfile Integration
```bash
# Via Taskfile (see 01-taskfile.md)
task cursor -- "Review this code"
task cursor:review
task cursor:refactor
```

### N8N Integration
```bash
# Trigger via N8N workflows
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Review code for security issues"}'
```

### Development Workflow
```bash
# 1. Setup infrastructure
task setup

# 2. Start development environment
task serve

# 3. Use Cursor CLI for coding tasks
cursor-agent chat "Generate API documentation"

# 4. Results integrated into workflows
# 5. Changes tracked and deployed
```

## Best Practices

### Prompt Engineering
**Good Prompts:**
- ✅ Specific and focused: "Review src/auth.ts for security vulnerabilities"
- ✅ Include context: "Review this React component for performance issues"
- ✅ Clear requirements: "Generate unit tests for all public methods"

**Poor Prompts:**
- ❌ Too vague: "Fix the code"
- ❌ Too broad: "Review everything"
- ❌ No context: "Make it better"

### Project Context
1. **Set project path** for accurate context awareness
2. **Include relevant files** in prompts when needed
3. **Specify technology stack** (React, Node.js, Python, etc.)
4. **Mention dependencies** and constraints

### Error Handling
1. **Test commands** before automation
2. **Handle failures gracefully** in automated workflows
3. **Monitor execution** for timeouts and errors
4. **Log results** for debugging and analysis

### Performance
1. **Use appropriate models** for different tasks
2. **Break large tasks** into smaller, focused requests
3. **Monitor token usage** and costs
4. **Cache results** for repeated operations

## Configuration

### Environment Variables
```bash
# Set default model
export CURSOR_DEFAULT_MODEL=claude-4-sonnet

# Set timeout (seconds)
export CURSOR_TIMEOUT=300

# Set project path
export CURSOR_PROJECT_PATH=/path/to/project

# Enable debug mode
export CURSOR_DEBUG=true
```

### Configuration File
```json
// ~/.cursor/config.json
{
  "models": {
    "default": "claude-4-sonnet",
    "fast": "claude-4-haiku"
  },
  "mcp": {
    "servers": {
      "custom-commands": {
        "command": "node",
        "args": ["/path/to/custom-commands.js"]
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

**Command not found:**
```bash
# Check PATH
echo $PATH
which cursor-agent

# Reinstall if needed
curl https://cursor.com/install -fsS | bash
```

**Permission errors:**
```bash
# Fix execute permissions
chmod +x ~/.local/bin/cursor-agent
```

**Timeout issues:**
```bash
# Increase timeout
export CURSOR_TIMEOUT=600

# Use smaller, focused prompts
cursor-agent chat "Review just this function"
```

**Context issues:**
```bash
# Set project path explicitly
export CURSOR_PROJECT_PATH=/path/to/project
cd /path/to/project && cursor-agent chat "Review this codebase"
```

## Integration Examples

### With Git Hooks
```bash
# Pre-commit hook for code review
#!/bin/bash
# .git/hooks/pre-commit
cursor-agent chat "Review changes for security issues" --input "$(git diff --cached)"
```

### With CI/CD
```yaml
# GitHub Actions
- name: AI Code Review
  run: |
    cursor-agent chat "Review PR changes for security and quality issues"
```

### With Development Tools
```bash
# VS Code task
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "AI Code Review",
      "type": "shell",
      "command": "cursor-agent",
      "args": ["chat", "Review this code for improvements"],
      "group": "build"
    }
  ]
}
```

Cursor CLI provides a powerful AI assistant for all aspects of software development, from code generation and review to debugging and documentation. When integrated with N8N workflows, it becomes a complete automation platform for AI-powered development processes.
