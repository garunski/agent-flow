# Manual Cursor CLI

Direct usage of Cursor CLI for development and testing.

## Overview

Cursor CLI provides:
- Interactive coding sessions
- Non-interactive automation
- Project context awareness
- Multiple AI models

## Installation

```bash
# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
cursor-agent --version
```

## Usage

### Interactive Mode

```bash
# Start interactive session
cursor-agent

# In interactive mode
> Review the authentication module
> Generate tests for UserService
> Refactor the database connection logic
```

### Non-Interactive Mode

```bash
# Single command
cursor-agent chat "Review src/auth.ts for security issues"

# With project context
cd /path/to/project && cursor-agent chat "Fix all TypeScript errors"

# With specific model
cursor-agent chat "Generate API documentation" --model claude-4-opus
```

## Common Commands

### Code Review
```bash
cursor-agent chat "Review this code for bugs and improvements"
```

### Refactoring
```bash
cursor-agent chat "Refactor this function to follow SOLID principles"
```

### Testing
```bash
cursor-agent chat "Generate unit tests for all public methods"
```

### Documentation
```bash
cursor-agent chat "Update README.md with recent changes"
```

### Debugging
```bash
cursor-agent chat "Find and fix the memory leak in this code"
```

## Project Context

Cursor CLI automatically detects:
- Project structure
- Dependencies
- Configuration files
- Git history

## Configuration

```bash
# Set default model
export CURSOR_DEFAULT_MODEL=claude-4-sonnet

# Set timeout
export CURSOR_TIMEOUT=300

# Set project path
export CURSOR_PROJECT_PATH=/path/to/project
```

## Custom Commands Integration

Cursor CLI supports custom commands through MCP (Model Context Protocol) servers and custom command definitions.

### MCP Server Integration

Create custom MCP servers for specialized functionality:

**mcp-server.js:**
```javascript
// Custom MCP server for project-specific commands
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

class CustomMCPServer {
  async run() {
    const server = new Server(
      {
        name: 'custom-commands',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Define custom tools
    server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'run-tests',
          description: 'Run project test suite',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'check-coverage',
          description: 'Check test coverage',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'deploy-preview',
          description: 'Deploy to preview environment',
          inputSchema: {
            type: 'object',
            properties: {
              branch: { type: 'string' },
            },
          },
        },
      ],
    }));

    server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'run-tests':
          return await this.runTests();
        case 'check-coverage':
          return await this.checkCoverage();
        case 'deploy-preview':
          return await this.deployPreview(args.branch);
      }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  async runTests() {
    // Execute test command
    return { result: 'Tests completed successfully' };
  }

  async checkCoverage() {
    // Check test coverage
    return { result: 'Coverage: 85%' };
  }

  async deployPreview(branch) {
    // Deploy to preview environment
    return { result: `Deployed ${branch} to preview` };
  }
}
```

### Custom Slash Commands

Define custom slash commands in Cursor configuration:

**config/cursor-commands.js:**
```javascript
// Custom command definitions
module.exports = {
  commands: {
    '/test': {
      description: 'Run project tests',
      execute: async (args) => {
        const { execSync } = require('child_process');
        try {
          const output = execSync('npm test', { encoding: 'utf8' });
          return `✅ Tests passed:\n${output}`;
        } catch (error) {
          return `❌ Tests failed:\n${error.stdout}`;
        }
      }
    },

    '/coverage': {
      description: 'Check test coverage',
      execute: async (args) => {
        const { execSync } = require('child_process');
        try {
          const output = execSync('npm run coverage', { encoding: 'utf8' });
          return `📊 Coverage report:\n${output}`;
        } catch (error) {
          return `❌ Coverage check failed:\n${error.stdout}`;
        }
      }
    },

    '/deploy': {
      description: 'Deploy current branch',
      execute: async (args) => {
        const branch = args[0] || 'main';
        // Trigger deployment via webhook
        const response = await fetch('http://localhost:5678/webhook/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch })
        });
        return `🚀 Deployment triggered for ${branch}`;
      }
    },

    '/review': {
      description: 'AI code review of current changes',
      execute: async (args) => {
        // Trigger N8N workflow for code review
        const response = await fetch('http://localhost:5678/webhook/code-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Review recent changes and suggest improvements',
            projectPath: process.cwd()
          })
        });
        const result = await response.json();
        return `🔍 Code review completed:\n${result.output}`;
      }
    }
  }
};
```

### Cursor Configuration

**~/.cursor/config.json:**
```json
{
  "mcp": {
    "servers": {
      "custom-commands": {
        "command": "node",
        "args": ["/path/to/mcp-server.js"]
      }
    }
  },
  "commands": {
    "custom": "/path/to/config/cursor-commands.js"
  },
  "models": {
    "default": "claude-4-sonnet",
    "fast": "claude-4-haiku"
  }
}
```

### Usage with Custom Commands

```bash
# Use slash commands in interactive mode
cursor-agent

# In interactive mode:
> /test
> /coverage
> /deploy feature-branch
> /review

# Or trigger via N8N workflows
curl -X POST http://localhost:5678/webhook/code-review \
  -H "Content-Type: application/json" \
  -d '{"prompt": "/review recent changes"}'
```

## Integration

### With Taskfile
```yaml
# Taskfile.yml - Enhanced with custom commands
tasks:
  cursor:
    cmds:
      - cursor-agent chat "{{ .CLI_ARGS }}"

  test:
    desc: "Run tests via Cursor command"
    cmds:
      - cursor-agent chat "/test"

  deploy:
    desc: "Deploy via Cursor command"
    cmds:
      - cursor-agent chat "/deploy {{ .CLI_ARGS }}"

  review:
    desc: "Code review via Cursor command"
    cmds:
      - cursor-agent chat "/review"
```

### With N8N Workflows

```json
{
  "name": "Custom Command Workflow",
  "nodes": [
    {
      "parameters": {
        "command": "cursor-agent chat \"/test\" --project-path \"{{ $json.projectPath }}\"",
        "executeOnce": true
      },
      "name": "Execute Custom Test Command",
      "type": "n8n-nodes-base.executeCommand"
    }
  ]
}
```

### Advanced Custom Commands

**Database Operations:**
```javascript
'/migrate': {
  description: 'Run database migrations',
  execute: async () => {
    // Execute migrations via N8N webhook
    const response = await fetch('http://localhost:5678/webhook/db-migrate', {
      method: 'POST'
    });
    return '✅ Database migrated successfully';
  }
}
```

**Git Operations:**
```javascript
'/commit': {
  description: 'AI-powered commit message generation',
  execute: async (args) => {
    const message = args.join(' ') || 'Auto-generated commit';
    // Trigger commit workflow
    return `✅ Committed with message: "${message}"`;
  }
}
```

## Best Practices for Custom Commands

1. **Keep commands focused** - Single responsibility per command
2. **Handle errors gracefully** - Provide meaningful error messages
3. **Use async/await** - For non-blocking operations
4. **Validate inputs** - Check arguments before execution
5. **Provide feedback** - Clear success/error messages
6. **Integrate with N8N** - Trigger workflows from commands
7. **Test thoroughly** - Commands should be reliable

## Integration

### With Taskfile
```yaml
# Taskfile.yml
tasks:
  cursor:
    cmds:
      - cursor-agent chat "{{ .CLI_ARGS }}"
```

### With N8N
```bash
# Execute from N8N
cursor-agent chat "{{ $json.prompt }}" --project-path "{{ $json.projectPath }}"

# Or trigger custom commands from N8N
cursor-agent chat "/test"
```

## Best Practices

1. **Be specific** with prompts
2. **Provide context** about the project
3. **Use project-relative paths**
4. **Test commands** before automation
5. **Monitor token usage**
6. **Create reusable custom commands** for common operations
