# Complete Guide: Cursor CLI + N8N Workflow Automation

## Table of Contents
1. [Overview](#overview)
2. [Understanding Cursor CLI](#understanding-cursor-cli)
3. [Installing N8N Locally](#installing-n8n-locally)
4. [Complete N8N Workflow Configuration](#complete-n8n-workflow-configuration)
5. [How to Import and Use](#how-to-import-and-use)
6. [Advanced Configurations](#advanced-configurations)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides everything you need to set up an automated workflow system that uses N8N to trigger Cursor CLI commands. This enables you to:

- Automate code reviews, refactoring, and documentation
- Create state-machine-like workflows with strict step enforcement
- Trigger Cursor CLI via webhooks, schedules, or manual triggers
- Integrate AI-powered coding into your CI/CD pipeline

**Key Technologies:**
- **Cursor CLI**: Terminal-based AI coding assistant
- **N8N**: Open-source workflow automation platform

---

## Understanding Cursor CLI

### What is Cursor CLI?

Cursor CLI is a terminal-based AI assistant that allows developers to write, review, debug, and test code directly from the command line using natural language prompts.

### Key Features

- **Interactive Mode**: Conversational session in terminal
  ```bash
  cursor-agent
  ```

- **Non-Interactive Mode**: Run prompts directly (perfect for automation)
  ```bash
  cursor-agent chat "generate tests for the travel app's search functionality"
  ```

- **Background Execution**: Run multiple agents in parallel without blocking
- **Multi-Model Support**: Choose between GPT, Claude, and other models
- **MCP Support**: Model Context Protocol for extended capabilities

### Installation

```bash
# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Verify installation
cursor-agent --version

# Add to PATH (bash)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Add to PATH (zsh)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Basic Usage Examples

```bash
# Review code
cursor-agent chat "Review README.md and suggest improvements"

# Generate code
cursor-agent chat "Create a REST API endpoint for user authentication"

# Debug issues
cursor-agent chat "Find and fix bugs in src/components/UserCard.tsx"

# Generate tests
cursor-agent chat "Generate unit tests for all functions in utils/"
```

---

## Installing N8N Locally

### Minimum Requirements

**Hardware:**
- Minimum 1 GB RAM (2 GB recommended)
- 500 MB free disk space

**Software:**
- Node.js v18 or newer (for npm installation)
- Docker (optional but recommended)

**Operating Systems:**
- Windows 10/11
- macOS Catalina or later
- Ubuntu 18.04+ or equivalent Linux

---

### Method 1: NPM Installation (Fastest)

```bash
# Step 1: Install Node.js (if needed)
# Download from: https://nodejs.org/

# Step 2: Verify Node.js and npm
node -v
npm -v

# Step 3: Install n8n globally
npm install -g n8n

# Step 4: Start n8n
n8n

# Step 5: Open browser
# Navigate to: http://localhost:5678
```

**Advantages:**
- Simple and direct
- Easy to update
- Great for development

---

### Method 2: Docker (Recommended)

```bash
# Simple run (no persistent data)
docker run -it --rm -p 5678:5678 n8nio/n8n

# With persistent data (workflows saved)
docker run -it --rm -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --name n8n \
  n8nio/n8n

# Open browser to: http://localhost:5678
```

**Advantages:**
- No system pollution
- Easy to remove/update
- Works on all platforms
- Isolated environment

---

### Method 3: Docker Compose (Production-Like)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yourpassword
    restart: unless-stopped
```

Start N8N:
```bash
docker-compose up -d
```

**Advantages:**
- Persistent data
- Security (basic auth)
- Auto-restart
- Easy configuration management

---

### Comparison Table

| Method | Setup Time | Persistent Data | Best For |
|--------|------------|-----------------|----------|
| NPM | 2 minutes | ✅ Automatic | Quick testing, development |
| Docker (simple) | 1 minute | ❌ Loses data | Quick testing |
| Docker (volume) | 1 minute | ✅ Persistent | Daily use |
| Docker Compose | 3 minutes | ✅ Persistent + Secure | Production |

---

## Complete N8N Workflow Configuration

### Full Workflow JSON

This complete workflow includes:
- **3 Trigger Options**: Manual, Webhook, and Schedule
- **Cursor CLI Execution**: With error handling
- **Output Parsing**: Clean response formatting
- **Success/Failure Routes**: Different handling paths
- **Logging**: Execution tracking

```json
{
  "name": "Cursor CLI Automation Workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "cursor-trigger",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-node",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300],
      "webhookId": "cursor-webhook"
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        }
      },
      "id": "schedule-node",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 500],
      "disabled": true
    },
    {
      "parameters": {},
      "id": "manual-node",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [240, 100]
    },
    {
      "parameters": {
        "jsCode": "// Extract and prepare prompt for Cursor CLI\nconst inputData = $input.all();\n\n// Get prompt from webhook body or use default\nconst prompt = inputData[0]?.json?.prompt || inputData[0]?.json?.body?.prompt || \"Review the code in the current directory and suggest improvements\";\n\n// Get optional project path\nconst projectPath = inputData[0]?.json?.project_path || inputData[0]?.json?.body?.project_path || process.env.HOME + \"/projects/default\";\n\n// Get optional model preference\nconst model = inputData[0]?.json?.model || \"\";\n\n// Prepare output\nreturn {\n  json: {\n    prompt: prompt,\n    projectPath: projectPath,\n    model: model,\n    timestamp: new Date().toISOString()\n  }\n};"
      },
      "id": "code-node",
      "name": "Prepare Cursor Command",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "command": "=cd {{ $json.projectPath }} && cursor-agent chat \"{{ $json.prompt }}\"",
        "executeOnce": true
      },
      "id": "execute-cursor",
      "name": "Execute Cursor CLI",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse Cursor CLI output\nconst items = $input.all();\nconst output = items[0]?.json;\n\n// Extract stdout and stderr\nconst stdout = output?.stdout || \"\";\nconst stderr = output?.stderr || \"\";\nconst exitCode = output?.exitCode || 0;\n\n// Determine success\nconst success = exitCode === 0 && stderr === \"\";\n\n// Parse and clean output\nlet parsedOutput = stdout;\ntry {\n  // Try to parse if it's JSON\n  parsedOutput = JSON.parse(stdout);\n} catch (e) {\n  // Keep as string if not JSON\n  parsedOutput = stdout.trim();\n}\n\nreturn {\n  json: {\n    success: success,\n    exitCode: exitCode,\n    output: parsedOutput,\n    error: stderr,\n    executedAt: new Date().toISOString(),\n    originalPrompt: items[0]?.json?.prompt || \"unknown\"\n  }\n};"
      },
      "id": "parse-output",
      "name": "Parse Cursor Output",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [900, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.success }}",
              "value2": true
            }
          ]
        }
      },
      "id": "if-node",
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "id": "webhook-response-success",
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1340, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": false,\n  \"error\": \"{{ $json.error }}\",\n  \"exitCode\": {{ $json.exitCode }},\n  \"message\": \"Cursor CLI execution failed\"\n}"
      },
      "id": "webhook-response-error",
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1340, 400]
    },
    {
      "parameters": {
        "jsCode": "// Log execution details\nconst data = $input.all()[0]?.json;\n\nconsole.log('=== Cursor CLI Execution Log ===');\nconsole.log('Timestamp:', data.executedAt);\nconsole.log('Prompt:', data.originalPrompt);\nconsole.log('Success:', data.success);\nconsole.log('Output:', data.output);\nif (data.error) {\n  console.log('Error:', data.error);\n}\nconsole.log('================================');\n\nreturn $input.all();"
      },
      "id": "logger-node",
      "name": "Log Results",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1560, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Prepare Cursor Command",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Prepare Cursor Command",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Prepare Cursor Command",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Cursor Command": {
      "main": [
        [
          {
            "node": "Execute Cursor CLI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute Cursor CLI": {
      "main": [
        [
          {
            "node": "Parse Cursor Output",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse Cursor Output": {
      "main": [
        [
          {
            "node": "Check Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Success": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Log Results",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Log Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 0,
  "updatedAt": "2025-01-07T12:00:00.000Z",
  "versionId": "1"
}
```

---

## How to Import and Use

### Importing the Workflow

1. **Copy the JSON above**
2. **Open N8N** at http://localhost:5678
3. **Click the "+" button** (top right corner)
4. **Select "Import from File/URL"**
5. **Paste the JSON** or save as `cursor-cli-workflow.json` and import
6. **Click "Import"**

### Using the Workflow

#### Option 1: Manual Trigger (Testing)

1. Open the workflow in N8N
2. Click on the **"Manual Trigger"** node
3. Click **"Execute Workflow"** button
4. View results in the execution panel

#### Option 2: Webhook Trigger (API Integration)

**Basic cURL Example:**
```bash
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Review the authentication module and suggest security improvements",
    "project_path": "/path/to/your/project"
  }'
```

**Advanced cURL Example:**
```bash
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate unit tests for all functions in src/utils/",
    "project_path": "/Users/yourname/projects/myapp",
    "model": "claude-4-opus"
  }'
```

**JavaScript/Fetch Example:**
```javascript
fetch('http://localhost:5678/webhook/cursor-trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Refactor the database connection logic',
    project_path: '/path/to/project',
    model: 'gpt-4o'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data.success);
  console.log('Output:', data.output);
})
.catch(error => console.error('Error:', error));
```

**Python Example:**
```python
import requests

response = requests.post(
    'http://localhost:5678/webhook/cursor-trigger',
    json={
        'prompt': 'Add error handling to the API endpoints',
        'project_path': '/home/user/myproject',
        'model': 'claude-4-sonnet'
    }
)

result = response.json()
print(f"Success: {result['success']}")
print(f"Output: {result['output']}")
```

#### Option 3: Scheduled Trigger (Automation)

1. **Enable the "Schedule Trigger" node** in N8N (currently disabled)
2. **Edit the cron expression:**
   - `0 9 * * *` = Every day at 9 AM
   - `0 */4 * * *` = Every 4 hours
   - `0 0 * * 1` = Every Monday at midnight
   - `*/30 * * * *` = Every 30 minutes
3. **Modify the "Prepare Cursor Command" node** to set a default prompt for scheduled runs

---

## Advanced Configurations

### Docker Compose with Cursor CLI Support

If running N8N in Docker and want to use Cursor CLI inside the container:

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ~/.cursor:/home/node/.cursor  # Mount Cursor config
      - ~/projects:/projects  # Mount your projects
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yourpassword
      - DEFAULT_PROJECT_PATH=/projects/default
      - NODE_ENV=production
    restart: unless-stopped
```

**Note:** You'll need to install Cursor CLI inside the container:

```bash
# Exec into container
docker exec -it <container-name> sh

# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Or add to Dockerfile
FROM n8nio/n8n
USER root
RUN apk add --no-cache curl bash
RUN curl https://cursor.com/install -fsS | bash
USER node
```

### Environment Variables

Create a `.env` file for sensitive data:

```bash
# N8N Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password

# Default Paths
DEFAULT_PROJECT_PATH=/Users/yourname/projects/default

# Cursor Settings
CURSOR_API_KEY=your_cursor_api_key

# N8N Settings
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_HOST=localhost

# Timezone
GENERIC_TIMEZONE=America/New_York
```

Reference in Docker Compose:
```yaml
services:
  n8n:
    env_file: .env
```

### Multi-Step State Machine Workflow

Here's an advanced workflow that enforces sequential steps:

```json
{
  "name": "Feature Development Pipeline",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "feature-pipeline"
      },
      "name": "Start Pipeline",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "command": "=cd {{ $json.projectPath }} && cursor-agent chat \"Create requirements document for {{ $json.featureName }}\""
      },
      "name": "Step 1: Requirements",
      "type": "n8n-nodes-base.executeCommand",
      "position": [460, 300]
    },
    {
      "parameters": {
        "mode": "wait",
        "resume": "webhook",
        "resumeWebhookId": "approval-1"
      },
      "name": "Wait for Approval 1",
      "type": "n8n-nodes-base.wait",
      "position": [680, 300]
    },
    {
      "parameters": {
        "command": "=cd {{ $json.projectPath }} && cursor-agent chat \"Design architecture for {{ $json.featureName }} based on requirements\""
      },
      "name": "Step 2: Design",
      "type": "n8n-nodes-base.executeCommand",
      "position": [900, 300]
    },
    {
      "parameters": {
        "mode": "wait",
        "resume": "webhook",
        "resumeWebhookId": "approval-2"
      },
      "name": "Wait for Approval 2",
      "type": "n8n-nodes-base.wait",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "command": "=cd {{ $json.projectPath }} && cursor-agent chat \"Implement {{ $json.featureName }} following the design\""
      },
      "name": "Step 3: Implementation",
      "type": "n8n-nodes-base.executeCommand",
      "position": [1340, 300]
    },
    {
      "parameters": {
        "command": "=cd {{ $json.projectPath }} && cursor-agent chat \"Generate comprehensive tests for {{ $json.featureName }}\""
      },
      "name": "Step 4: Testing",
      "type": "n8n-nodes-base.executeCommand",
      "position": [1560, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"completed\", \"feature\": $json.featureName } }}"
      },
      "name": "Pipeline Complete",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1780, 300]
    }
  ],
  "connections": {
    "Start Pipeline": {
      "main": [[{ "node": "Step 1: Requirements", "type": "main", "index": 0 }]]
    },
    "Step 1: Requirements": {
      "main": [[{ "node": "Wait for Approval 1", "type": "main", "index": 0 }]]
    },
    "Wait for Approval 1": {
      "main": [[{ "node": "Step 2: Design", "type": "main", "index": 0 }]]
    },
    "Step 2: Design": {
      "main": [[{ "node": "Wait for Approval 2", "type": "main", "index": 0 }]]
    },
    "Wait for Approval 2": {
      "main": [[{ "node": "Step 3: Implementation", "type": "main", "index": 0 }]]
    },
    "Step 3: Implementation": {
      "main": [[{ "node": "Step 4: Testing", "type": "main", "index": 0 }]]
    },
    "Step 4: Testing": {
      "main": [[{ "node": "Pipeline Complete", "type": "main", "index": 0 }]]
    }
  }
}
```

**To use this pipeline:**

1. **Start the pipeline:**
```bash
curl -X POST http://localhost:5678/webhook/feature-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "featureName": "user-authentication",
    "projectPath": "/path/to/project"
  }'
```

2. **Approve step 1:**
```bash
curl -X POST http://localhost:5678/webhook/<execution-id>/approval-1
```

3. **Approve step 2:**
```bash
curl -X POST http://localhost:5678/webhook/<execution-id>/approval-2
```

### Integration with Other Tools

#### Slack Notifications

Add a Slack node after execution:

```json
{
  "parameters": {
    "channel": "#dev-notifications",
    "text": "=Cursor CLI execution completed!\nPrompt: {{ $json.originalPrompt }}\nSuccess: {{ $json.success }}"
  },
  "name": "Notify Slack",
  "type": "n8n-nodes-base.slack"
}
```

#### GitHub Integration

Create a GitHub issue with the results:

```json
{
  "parameters": {
    "resource": "issue",
    "operation": "create",
    "title": "=Code Review: {{ $json.originalPrompt }}",
    "body": "={{ $json.output }}",
    "repository": "your-repo",
    "owner": "your-username"
  },
  "name": "Create GitHub Issue",
  "type": "n8n-nodes-base.github"
}
```

#### Email Notifications

Send results via email:

```json
{
  "parameters": {
    "fromEmail": "noreply@yourdomain.com",
    "toEmail": "dev@yourdomain.com",
    "subject": "=Cursor CLI Result: {{ $json.originalPrompt }}",
    "text": "={{ $json.output }}"
  },
  "name": "Send Email",
  "type": "n8n-nodes-base.emailSend"
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "cursor-agent: command not found"

**Cause:** Cursor CLI not installed or not in PATH

**Solutions:**

1. **Install Cursor CLI:**
```bash
curl https://cursor.com/install -fsS | bash
```

2. **Add to PATH:**
```bash
# Bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Zsh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

3. **If using Docker, install inside container:**
```bash
docker exec -it n8n sh
curl https://cursor.com/install -fsS | bash
```

---

#### Issue: "Permission denied"

**Cause:** Execute permissions missing

**Solution:**
```bash
chmod +x ~/.local/bin/cursor-agent
```

---

#### Issue: Port 5678 already in use

**Cause:** Another service using port 5678

**Solutions:**

1. **Change N8N port:**
```bash
# NPM
N8N_PORT=5679 n8n

# Docker
docker run -p 5679:5678 n8nio/n8n
```

2. **Stop conflicting service:**
```bash
# Find process using port
lsof -i :5678

# Kill process
kill -9 <PID>
```

---

#### Issue: Workflows lost after restart

**Cause:** No persistent storage configured

**Solution:**
```bash
# Docker with volume
docker run -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Docker Compose (already configured in examples above)
```

---

#### Issue: "Cannot find module" errors

**Cause:** Node.js dependencies not installed

**Solution:**
```bash
# NPM
npm install -g n8n

# Docker (rebuild image)
docker pull n8nio/n8n:latest
```

---

#### Issue: Cursor CLI times out

**Cause:** Command takes too long to execute

**Solution:** Increase timeout in Execute Command node:

```json
{
  "parameters": {
    "command": "your command",
    "timeout": 300000  // 5 minutes in milliseconds
  }
}
```

---

#### Issue: Docker container can't access project files

**Cause:** Project directory not mounted

**Solution:** Mount volumes in Docker:
```bash
docker run -v ~/projects:/projects n8nio/n8n
```

Or in Docker Compose:
```yaml
volumes:
  - ~/projects:/projects
  - ~/.cursor:/home/node/.cursor
```

---

### Debugging Tips

#### Enable Debug Logging

```bash
# NPM
N8N_LOG_LEVEL=debug n8n

# Docker
docker run -e N8N_LOG_LEVEL=debug n8nio/n8n
```

#### Check N8N Logs

```bash
# Docker
docker logs <container-name>

# Docker Compose
docker-compose logs -f n8n
```

#### Test Cursor CLI Manually

```bash
# Test if Cursor CLI works
cursor-agent chat "test prompt"

# Test with specific project
cd /path/to/project && cursor-agent chat "test prompt"
```

#### Verify N8N Webhooks

```bash
# Test webhook endpoint
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' \
  -v
```

---

## Performance Optimization

### For Heavy Workloads

**Increase Memory Limits (Docker):**
```yaml
services:
  n8n:
    image: n8nio/n8n
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

**Use Queue Mode for Multiple Executions:**
```yaml
environment:
  - EXECUTIONS_MODE=queue
  - QUEUE_BULL_REDIS_HOST=redis
```

### For Faster Response Times

**Use Background Execution:**
```json
{
  "parameters": {
    "command": "cursor-agent chat \"{{ $json.prompt }}\" &"
  }
}
```

**Cache Frequently Used Results:**
Add a Redis cache node between Execute Command and Parse Output nodes.

---

## Security Best Practices

### Enable Authentication

```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=strong_password_here
```

### Use HTTPS

```yaml
environment:
  - N8N_PROTOCOL=https
  - N8N_SSL_KEY=/path/to/ssl/key.pem
  - N8N_SSL_CERT=/path/to/ssl/cert.pem
```

### Limit Webhook Access

Use firewall rules or reverse proxy:
```nginx
location /webhook/ {
    allow 192.168.1.0/24;  # Your network
    deny all;
    proxy_pass http://localhost:5678;
}
```

### Secure Cursor API Keys

Store in environment variables, never in workflow JSON:
```yaml
environment:
  - CURSOR_API_KEY=${CURSOR_API_KEY}
```

---

## Useful Commands Reference

### N8N Commands
```bash
# Start N8N (NPM)
n8n

# Start with custom port
N8N_PORT=5679 n8n

# Export workflows
n8n export:workflow --all --output=./backups/

# Import workflows
n8n import:workflow --input=./workflow.json

# Update N8N
npm update -g n8n
```

### Docker Commands
```bash
# Start N8N
docker run -d -p 5678:5678 --name n8n n8nio/n8n

# Stop N8N
docker stop n8n

# View logs
docker logs -f n8n

# Restart N8N
docker restart n8n

# Remove N8N container
docker rm -f n8n

# Update N8N image
docker pull n8nio/n8n:latest

# Exec into container
docker exec -it n8n sh

# Check container stats
docker stats n8n
```

### Cursor CLI Commands
```bash
# Interactive mode
cursor-agent

# Non-interactive (automation)
cursor-agent chat "your prompt here"

# With specific model
cursor-agent chat "your prompt" --model claude-4-opus

# Check version
cursor-agent --version

# Get help
cursor-agent --help
```

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# Check status
docker-compose ps
```

---

## Real-World Use Cases

### Use Case 1: Automated Code Reviews

**Trigger:** On Git push via webhook
**Workflow:**
1. Receive webhook from GitHub
2. Get list of changed files
3. Run Cursor CLI to review each file
4. Post results as GitHub comment

**Webhook payload from GitHub:**
```json
{
  "repository": "myrepo",
  "commits": [
    {
      "modified": ["src/auth.ts", "src/utils.ts"]
    }
  ]
}
```

### Use Case 2: Scheduled Documentation Updates

**Trigger:** Daily at 9 AM
**Workflow:**
1. Scan codebase for changes
2. Run Cursor CLI: "Update README.md with recent changes"
3. Commit and push changes
4. Send Slack notification

### Use Case 3: Bug Fix Pipeline

**Trigger:** Manual or bug tracker webhook
**Workflow:**
1. Receive bug description
2. Run Cursor CLI: "Analyze and fix bug: {description}"
3. Run tests
4. Create pull request if tests pass
5. Notify team

### Use Case 4: Feature Development State Machine

**Trigger:** Manual with feature name
**Workflow:**
1. **Requirements Phase**
   - Cursor CLI: "Create requirements for {feature}"
   - Wait for human approval
2. **Design Phase**
   - Cursor CLI: "Design architecture for {feature}"
   - Wait for human approval
3. **Implementation Phase**
   - Cursor CLI: "Implement {feature}"
   - Auto-run linter and formatter
4. **Testing Phase**
   - Cursor CLI: "Generate tests for {feature}"
   - Run test suite
5. **Documentation Phase**
   - Cursor CLI: "Update documentation for {feature}"
   - Create PR

---

## Advanced Workflow Examples

### Example 1: Multi-File Code Refactoring

```json
{
  "name": "Batch Code Refactoring",
  "nodes": [
    {
      "parameters": {
        "command": "find {{ $json.projectPath }}/src -name '*.ts' -type f"
      },
      "name": "Find TypeScript Files",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "jsCode": "const files = $input.first().json.stdout.split('\\n').filter(f => f);\nreturn files.map(file => ({ json: { file } }));"
      },
      "name": "Split Files",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "command": "=cursor-agent chat \"Refactor {{ $json.file }} to use modern TypeScript patterns\"",
        "executeOnce": false
      },
      "name": "Refactor Each File",
      "type": "n8n-nodes-base.executeCommand"
    }
  ]
}
```

### Example 2: Intelligent Code Review with Scoring

```json
{
  "name": "Scored Code Review",
  "nodes": [
    {
      "parameters": {
        "command": "=cursor-agent chat \"Review {{ $json.file }} and provide: 1) Issues found 2) Security concerns 3) Performance suggestions 4) Overall score 1-10\""
      },
      "name": "Analyze Code",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "jsCode": "const output = $input.first().json.stdout;\nconst scoreMatch = output.match(/score[:\\s]+(\\d+)/i);\nconst score = scoreMatch ? parseInt(scoreMatch[1]) : 5;\nreturn { json: { ...input.first().json, score, review: output } };"
      },
      "name": "Extract Score",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.score }}",
              "operation": "smaller",
              "value2": 7
            }
          ]
        }
      },
      "name": "Check If Needs Attention",
      "type": "n8n-nodes-base.if"
    }
  ]
}
```

### Example 3: Progressive Enhancement Workflow

```json
{
  "name": "Progressive Code Enhancement",
  "nodes": [
    {
      "parameters": {
        "command": "cursor-agent chat \"Add TypeScript types to {{ $json.file }}\""
      },
      "name": "Step 1: Add Types",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "command": "cursor-agent chat \"Add JSDoc comments to {{ $json.file }}\""
      },
      "name": "Step 2: Add Docs",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "command": "cursor-agent chat \"Add error handling to {{ $json.file }}\""
      },
      "name": "Step 3: Error Handling",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "command": "cursor-agent chat \"Add unit tests for {{ $json.file }}\""
      },
      "name": "Step 4: Add Tests",
      "type": "n8n-nodes-base.executeCommand"
    }
  ]
}
```

---

## Integration with MCP Servers

### Combining N8N + Cursor CLI + Spec-Workflow MCP

This creates the ultimate automated development pipeline:

**Architecture:**
```
N8N (External Orchestrator)
  ↓
Triggers Cursor CLI
  ↓
Cursor Agent (with Spec-Workflow MCP)
  ↓
Enforced Sequential Steps
  ↓
Results back to N8N
  ↓
Notifications/Storage/Deployment
```

**Setup:**

1. **Install Spec-Workflow MCP in Cursor:**
```json
{
  "mcp.servers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/project"]
    }
  }
}
```

2. **Create N8N workflow that triggers Cursor with spec commands:**
```bash
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -d '{
    "prompt": "Create a spec for user-authentication using spec-workflow",
    "project_path": "/path/to/project"
  }'
```

3. **The flow:**
   - N8N triggers Cursor CLI
   - Cursor uses Spec-Workflow MCP to create structured workflow
   - Requirements → Design → Tasks (enforced by MCP)
   - Results return to N8N
   - N8N handles notifications/deployment

---

## Monitoring and Analytics

### Track Execution Metrics

Add a metrics collection node:

```json
{
  "parameters": {
    "jsCode": "const metrics = {\n  executionId: $execution.id,\n  workflowName: $workflow.name,\n  prompt: $json.originalPrompt,\n  success: $json.success,\n  duration: Date.now() - new Date($json.timestamp).getTime(),\n  timestamp: new Date().toISOString()\n};\n\n// Store in database or send to analytics service\nreturn { json: metrics };"
  },
  "name": "Collect Metrics",
  "type": "n8n-nodes-base.code"
}
```

### Create Dashboard Data

Store execution data for visualization:

```json
{
  "parameters": {
    "operation": "insert",
    "table": "cursor_executions",
    "columns": "execution_id,prompt,success,duration,timestamp",
    "values": "={{ $json.executionId }},{{ $json.prompt }},{{ $json.success }},{{ $json.duration }},{{ $json.timestamp }}"
  },
  "name": "Store to Database",
  "type": "n8n-nodes-base.postgres"
}
```

---

## Cost Optimization

### Minimize API Calls

**Use caching for repeated prompts:**
```json
{
  "parameters": {
    "jsCode": "const cache = $workflow.staticData;\nconst cacheKey = `cursor_${$json.prompt}`;\n\nif (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 3600000) {\n  return { json: cache[cacheKey].result };\n}\n\n// Continue to execution\nreturn { json: $json };"
  },
  "name": "Check Cache",
  "type": "n8n-nodes-base.code"
}
```

### Batch Operations

Process multiple files in a single prompt:
```bash
cursor-agent chat "Review and suggest improvements for: file1.ts, file2.ts, file3.ts"
```

### Use Appropriate Models

```json
{
  "parameters": {
    "jsCode": "const complexity = $json.prompt.length;\nconst model = complexity > 500 ? 'claude-4-opus' : 'claude-4-sonnet';\nreturn { json: { ...$json, model } };"
  },
  "name": "Select Model by Complexity",
  "type": "n8n-nodes-base.code"
}
```

---

## Testing Your Workflows

### Unit Test Individual Nodes

```bash
# Test Execute Command node manually
cd /path/to/project && cursor-agent chat "test prompt"

# Test webhook
curl -X POST http://localhost:5678/webhook-test/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

### Integration Testing

Create a test workflow:

```json
{
  "name": "Cursor CLI Test Suite",
  "nodes": [
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "testCase",
              "value": "Simple prompt test"
            },
            {
              "name": "prompt",
              "value": "List files in current directory"
            }
          ]
        }
      },
      "name": "Test Cases",
      "type": "n8n-nodes-base.set"
    },
    {
      "parameters": {
        "command": "=cursor-agent chat \"{{ $json.prompt }}\""
      },
      "name": "Execute Test",
      "type": "n8n-nodes-base.executeCommand"
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.exitCode }}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      },
      "name": "Assert Success",
      "type": "n8n-nodes-base.if"
    }
  ]
}
```

---

## Backup and Recovery

### Export Workflows Regularly

```bash
# Manual export
n8n export:workflow --all --output=./backups/workflows-$(date +%Y%m%d).json

# Automated backup (add to cron)
0 2 * * * cd /path/to/n8n && n8n export:workflow --all --output=./backups/workflows-$(date +\%Y\%m\%d).json
```

### Backup N8N Data (Docker)

```bash
# Backup volume
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data

# Restore volume
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup-20250107.tar.gz -C /
```

### Version Control Workflows

```bash
# Export and commit to git
n8n export:workflow --all --output=./workflows/
git add workflows/
git commit -m "Backup workflows $(date +%Y-%m-%d)"
git push
```

---

## Scaling N8N

### Horizontal Scaling with Queue Mode

```yaml
version: "3.8"

services:
  redis:
    image: redis:alpine
    
  n8n-main:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    depends_on:
      - redis
      
  n8n-worker-1:
    image: n8nio/n8n
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    depends_on:
      - redis
    command: worker
      
  n8n-worker-2:
    image: n8nio/n8n
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    depends_on:
      - redis
    command: worker
```

### Load Balancing

Use nginx for load balancing:

```nginx
upstream n8n_backend {
    least_conn;
    server n8n-1:5678;
    server n8n-2:5678;
    server n8n-3:5678;
}

server {
    listen 80;
    server_name n8n.yourdomain.com;
    
    location / {
        proxy_pass http://n8n_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Automated Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  cursor-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger N8N Workflow
        run: |
          curl -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d "{
              \"prompt\": \"Review PR changes and provide feedback\",
              \"project_path\": \"$GITHUB_WORKSPACE\",
              \"pr_number\": \"${{ github.event.pull_request.number }}\"
            }"
```

### GitLab CI Example

```yaml
code_review:
  stage: review
  script:
    - |
      curl -X POST ${N8N_WEBHOOK_URL} \
        -H "Content-Type: application/json" \
        -d "{
          \"prompt\": \"Review merge request changes\",
          \"project_path\": \"${CI_PROJECT_DIR}\",
          \"mr_id\": \"${CI_MERGE_REQUEST_IID}\"
        }"
  only:
    - merge_requests
```

---

## Best Practices

### 1. Prompt Engineering for Cursor CLI

**Good Prompts:**
- ✅ "Review src/auth.ts for security vulnerabilities and suggest specific fixes"
- ✅ "Refactor UserService.ts to follow SOLID principles, focusing on single responsibility"
- ✅ "Generate unit tests for all public methods in PaymentProcessor.ts with edge cases"

**Poor Prompts:**
- ❌ "Fix the code"
- ❌ "Make it better"
- ❌ "Review everything"

### 2. Error Handling

Always include error handling nodes:
```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "number": [
              {
                "value1": "={{ $json.exitCode }}",
                "operation": "notEqual",
                "value2": 0
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "error"
        }
      ]
    }
  },
  "name": "Error Handler",
  "type": "n8n-nodes-base.switch"
}
```

### 3. Idempotency

Make workflows idempotent:
```json
{
  "parameters": {
    "jsCode": "const executionId = $workflow.id + '_' + Date.now();\n$workflow.staticData.executionId = executionId;\nreturn { json: { executionId } };"
  }
}
```

### 4. Resource Limits

Set timeouts and limits:
```json
{
  "parameters": {
    "command": "timeout 300 cursor-agent chat \"{{ $json.prompt }}\""
  }
}
```

### 5. Logging

Always log execution details:
```json
{
  "parameters": {
    "jsCode": "console.log(`[${new Date().toISOString()}] Executing: ${$json.prompt}`);\nreturn $input.all();"
  }
}
```

---

## FAQ

### Q: Can I use Cursor CLI without a Cursor subscription?
**A:** No, Cursor CLI requires an active Cursor subscription.

### Q: Does N8N Cloud support Execute Command node?
**A:** No, Execute Command node is only available in self-hosted N8N for security reasons.

### Q: Can I run multiple Cursor CLI commands in parallel?
**A:** Yes, use N8N's "Split In Batches" node with "Execute Once" disabled in the Execute Command node.

### Q: How do I secure my N8N webhooks?
**A:** Enable basic auth, use HTTPS, implement API key validation in workflow, or use a reverse proxy with authentication.

### Q: Can I use environment variables in prompts?
**A:** Yes, use N8N expressions: `={{ $env.VARIABLE_NAME }}`

### Q: What's the maximum prompt length for Cursor CLI?
**A:** It depends on the model used. Claude 4 Sonnet supports up to 200K tokens context.

### Q: How do I handle long-running Cursor operations?
**A:** Use background execution with the `&` operator or implement a polling mechanism with N8N's Wait node.

### Q: Can I use Cursor CLI with private repositories?
**A:** Yes, ensure the machine running N8N has access to the repository (SSH keys, tokens, etc.).

---

## Conclusion

You now have a complete, production-ready setup for automating Cursor CLI with N8N workflows. This system enables:

✅ **Strict workflow enforcement** with sequential steps
✅ **Multiple trigger options** (manual, webhook, scheduled)
✅ **Error handling** and logging
✅ **Scalability** with queue mode and workers
✅ **Integration** with CI/CD, Slack, GitHub, and more
✅ **State machine capabilities** for complex processes

### Next Steps

1. **Start with the basic workflow** - Import the JSON and test with manual trigger
2. **Add webhook triggers** - Integrate with your development tools
3. **Create custom workflows** - Build pipelines specific to your needs
4. **Scale as needed** - Add workers and queue mode when processing increases
5. **Monitor and optimize** - Track metrics and refine prompts

### Additional Resources

- **N8N Documentation:** https://docs.n8n.io
- **Cursor Documentation:** https://cursor.com/docs
- **MCP Specification:** https://modelcontextprotocol.io
- **Spec-Workflow MCP:** https://github.com/Pimzino/spec-workflow-mcp
- **N8N Community:** https://community.n8n.io

---

## Appendix: Quick Reference Commands

### Start N8N (Choose One)
```bash
# NPM
n8n

# Docker (simple)
docker run -it --rm -p 5678:5678 n8nio/n8n

# Docker (persistent)
docker run -it --rm -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Docker Compose
docker-compose up -d
```

### Trigger Workflow
```bash
# Basic
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Review code"}'

# With project path
curl -X POST http://localhost:5678/webhook/cursor-trigger \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Fix bugs", "project_path": "/path/to/project"}'
```

### Manage N8N
```bash
# Export workflows
n8n export:workflow --all --output=backup.json

# Import workflows
n8n import:workflow --input=backup.json

# Update N8N
npm update -g n8n

# Check logs (Docker)
docker logs -f n8n
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**License:** MIT