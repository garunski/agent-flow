# Taskfile Commands

Complete command-line automation for the entire Agent Flow system.

## Prerequisites Installation

Before using the Taskfile, install these required tools:

### Docker & Docker Compose

**macOS:**
```bash
# Install Docker Desktop from: https://docs.docker.com/desktop/mac/install/
# Docker Desktop includes Docker Compose

# Or using Homebrew
brew install --cask docker
brew install docker-compose
```

**Ubuntu/Debian:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Verify installation:**
```bash
docker --version
docker-compose --version
```

### Task (Task Runner)

**Install Task:**
```bash
# macOS with Homebrew
brew install go-task/tap/go-task

# Linux (Ubuntu/Debian)
sudo snap install task --classic

# Or download binary
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d

# Or with Go
go install github.com/go-task/task/v3/cmd/task@latest
```

**Verify installation:**
```bash
task --version
```

### Node.js & npm (for N8N development)

**Install Node.js:**
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Restart terminal
nvm install --lts
nvm use --lts

# Or download from: https://nodejs.org/
```

**Verify installation:**
```bash
node --version
npm --version
```

### Additional Tools (used by Taskfile)

**jq (for JSON processing):**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

**entr (for file watching):**
```bash
# macOS
brew install entr

# Ubuntu/Debian
sudo apt-get install entr
```

**curl (usually pre-installed):**
```bash
# Verify
curl --version
```

## Overview

Taskfile provides a unified interface for:
- Infrastructure management (Docker Compose)
- N8N workflow orchestration
- Cursor CLI execution
- Development workflow automation

## Complete Taskfile.yml

```yaml
# Taskfile.yml
version: '3'

vars:
  # Infrastructure
  DOCKER_COMPOSE_FILE: docker-compose.yml
  N8N_PORT: 5678
  N8N_URL: http://localhost:{{.N8N_PORT}}

  # Project
  PROJECT_ROOT: .
  WORKFLOWS_DIR: ./workflows
  ACTIVITIES_DIR: ./activities

  # Cursor CLI
  CURSOR_MODEL: claude-4-sonnet
  CURSOR_TIMEOUT: 300

env:
  N8N_BASIC_AUTH_USER: admin
  N8N_BASIC_AUTH_PASSWORD: "{{.N8N_PASSWORD}}"
  POSTGRES_PASSWORD: "{{.DB_PASSWORD}}"
  CURSOR_API_KEY: "{{.CURSOR_API_KEY}}"

tasks:
  # === INFRASTRUCTURE ===

  setup:
    desc: "Complete setup: build, start services, and configure"
    cmds:
      - docker-compose build
      - docker-compose up -d
      - task: wait-for-services
      - task: configure-n8n
      - echo "✅ Setup complete! N8N available at {{.N8N_URL}}"

  start:
    desc: "Start all services"
    cmds:
      - docker-compose up -d
      - task: wait-for-services
      - echo "🚀 Services started"

  stop:
    desc: "Stop all services"
    cmds:
      - docker-compose down
      - echo "⏹️ Services stopped"

  restart:
    desc: "Restart all services"
    cmds:
      - task: stop
      - task: start

  status:
    desc: "Show service status"
    cmds:
      - docker-compose ps

  # === DEVELOPMENT ===

  dev:
    desc: "Start development environment with hot reload"
    cmds:
      - docker-compose up -d
      - task: watch-workflows
      - task: watch-activities

  watch-workflows:
    desc: "Watch workflow files for changes"
    cmds:
      - echo "👀 Watching workflow files..."
      - find {{.WORKFLOWS_DIR}} -name "*.ts" -o -name "*.js" | entr -r task reload-workflows

  watch-activities:
    desc: "Watch activity files for changes"
    cmds:
      - echo "👀 Watching activity files..."
      - find {{.ACTIVITIES_DIR}} -name "*.ts" -o -name "*.js" | entr -r task reload-activities

  # === N8N MANAGEMENT ===

  ui:
    desc: "Open N8N UI in browser"
    cmds:
      - open {{.N8N_URL}} || echo "N8N UI: {{.N8N_URL}}"

  logs:
    desc: "Show N8N logs"
    cmds:
      - docker-compose logs -f n8n

  logs:db:
    desc: "Show database logs"
    cmds:
      - docker-compose logs -f postgres

  logs:all:
    desc: "Show all service logs"
    cmds:
      - docker-compose logs -f

  configure-n8n:
    desc: "Configure N8N settings"
    cmds:
      - docker-compose exec n8n n8n configure
      - echo "⚙️ N8N configured"

  reload-workflows:
    desc: "Reload workflows from code"
    cmds:
      - docker-compose exec n8n node -e "
          const { loadWorkflows } = require('./lib/workflow-loader');
          loadWorkflows().then(() => console.log('✅ Workflows reloaded'));
        "

  reload-activities:
    desc: "Reload custom activities"
    cmds:
      - docker-compose restart n8n
      - echo "🔄 Activities reloaded"

  # === WORKFLOW EXECUTION ===

  run-workflow:
    desc: "Execute a specific workflow"
    cmds:
      - |
        curl -s -X POST "{{.N8N_URL}}/webhook/{{.WORKFLOW_NAME}}" \
          -H "Content-Type: application/json" \
          -H "X-N8N-API-KEY: {{.N8N_API_KEY}}" \
          -d '{"prompt": "{{.PROMPT}}", "projectPath": "{{.PROJECT_PATH}}"}' \
          | jq .
    vars:
      WORKFLOW_NAME:
        sh: echo "{{.CLI_ARGS}}" | cut -d' ' -f1
      PROMPT:
        sh: echo "{{.CLI_ARGS}}" | cut -d' ' -f2-
      PROJECT_PATH: "{{.PROJECT_ROOT}}"

  list-workflows:
    desc: "List available workflows"
    cmds:
      - |
        curl -s "{{.N8N_URL}}/rest/workflows" \
          -H "X-N8N-API-KEY: {{.N8N_API_KEY}}" \
          | jq -r '.data[].name'

  trigger-workflow:
    desc: "Trigger workflow by name"
    cmds:
      - task: run-workflow

  # === CURSOR CLI ===

  cursor:
    desc: "Execute Cursor CLI command"
    cmds:
      - cd {{.PROJECT_PATH}} && cursor-agent chat "{{.CLI_ARGS}}"
    env:
      CURSOR_MODEL: "{{.CURSOR_MODEL}}"
      CURSOR_TIMEOUT: "{{.CURSOR_TIMEOUT}}"

  cursor:interactive:
    desc: "Start interactive Cursor CLI session"
    cmds:
      - cursor-agent

  cursor:review:
    desc: "Run code review with Cursor CLI"
    cmds:
      - task: cursor -- "Review code for bugs and improvements"

  cursor:refactor:
    desc: "Run refactoring with Cursor CLI"
    cmds:
      - task: cursor -- "Refactor code following best practices"

  cursor:test:
    desc: "Generate tests with Cursor CLI"
    cmds:
      - task: cursor -- "Generate comprehensive unit tests"

  cursor:docs:
    desc: "Update documentation with Cursor CLI"
    cmds:
      - task: cursor -- "Update documentation with recent changes"

  # === PROJECT MANAGEMENT ===

  clean:
    desc: "Clean all containers, volumes, and build cache"
    cmds:
      - docker-compose down -v --remove-orphans
      - docker system prune -f
      - echo "🧹 Cleaned up"

  reset:
    desc: "Reset everything to clean state"
    cmds:
      - task: stop
      - task: clean
      - rm -rf ~/.n8n postgres_data
      - echo "🔄 Reset complete"

  backup:
    desc: "Backup workflows and data"
    cmds:
      - mkdir -p backups
      - docker-compose exec n8n n8n export:workflow --all --output=../backups/workflows-$(date +%Y%m%d-%H%M%S).json
      - docker run --rm -v n8n_n8n-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/n8n-data-$(date +%Y%m%d-%H%M%S).tar.gz /data
      - echo "💾 Backup created"

  restore:
    desc: "Restore from backup"
    cmds:
      - task: stop
      - docker run --rm -v n8n_n8n-data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/{{.BACKUP_FILE}} -C /
      - task: start
      - echo "📥 Restored from backup"

  # === TESTING ===

  test:
    desc: "Run all tests"
    cmds:
      - npm test

  test:workflows:
    desc: "Test workflow definitions"
    cmds:
      - npx jest tests/workflows/

  test:activities:
    desc: "Test custom activities"
    cmds:
      - npx jest tests/activities/

  # === UTILITIES ===

  shell:
    desc: "Open shell in N8N container"
    cmds:
      - docker-compose exec n8n bash

  shell:db:
    desc: "Open PostgreSQL shell"
    cmds:
      - docker-compose exec postgres psql -U n8n -d n8n

  health:
    desc: "Check system health"
    cmds:
      - echo "🔍 Checking N8N..."
      - curl -f {{.N8N_URL}}/healthz || echo "❌ N8N not healthy"
      - echo "🔍 Checking PostgreSQL..."
      - docker-compose exec postgres pg_isready -U n8n || echo "❌ PostgreSQL not healthy"
      - echo "🔍 Checking Cursor CLI..."
      - cursor-agent --version || echo "❌ Cursor CLI not available"
      - echo "✅ Health check complete"

  wait-for-services:
    desc: "Wait for services to be ready"
    internal: true
    cmds:
      - |
        echo "⏳ Waiting for services..."
        timeout 60s bash -c 'until curl -f {{.N8N_URL}}/healthz >/dev/null 2>&1; do sleep 2; done'
        echo "✅ Services ready!"
```

## Environment Configuration

Create `.env` file for sensitive data:

```bash
# .env
N8N_PASSWORD=your_secure_password
DB_PASSWORD=your_db_password
CURSOR_API_KEY=your_cursor_api_key
N8N_API_KEY=your_n8n_api_key
```

Create `.env.example` for team sharing:

```bash
# .env.example
N8N_PASSWORD=
DB_PASSWORD=
CURSOR_API_KEY=
N8N_API_KEY=
```

## Usage Examples

### Development Workflow

```bash
# Setup and start everything
task setup

# Open N8N UI
task ui

# Make changes to workflows
# (watched automatically)

# Test a workflow
task run-workflow --name="code-review" --prompt="Review auth module"

# Check logs if needed
task logs
```

### Production Deployment

```bash
# Start production services
task start

# Run daily code review
task run-workflow --name="daily-review"

# Backup workflows
task backup

# Health monitoring
task health
```

### Development with Hot Reload

```bash
# Start development mode
task dev

# Edit workflow files - auto-reloaded
# Edit activity files - auto-reloaded

# Test changes
task run-workflow --name="test-workflow"
```

## Advanced Usage

### Custom Workflow Variables

```bash
# Pass multiple variables
task run-workflow --name="custom" \
  --prompt="Review specific file" \
  --project-path="/path/to/project" \
  --model="claude-4-opus"
```

### Workflow Debugging

```bash
# Enable debug logging
DEBUG=* task logs

# Test workflow step by step
task run-workflow --name="debug-workflow"

# Check workflow execution history
task shell
# Then: n8n execution list
```

### Integration with CI/CD

```bash
# In GitHub Actions
- name: Setup Agent Flow
  run: |
    task setup
    task health

- name: Run Code Review
  run: |
    task run-workflow --name="ci-review" \
      --prompt="Review PR changes"
```

## Error Handling

The Taskfile includes built-in error handling:

```bash
# Automatic retries for network issues
wait-for-services:
  cmds:
    - |
      for i in {1..10}; do
        if curl -f {{.N8N_URL}}/healthz >/dev/null 2>&1; then
          echo "✅ Service ready"; exit 0
        fi
        echo "⏳ Waiting... (attempt $i/10)"
        sleep 5
      done
      echo "❌ Service not ready after 10 attempts"; exit 1
```

## Best Practices

1. **Use variables** for all configuration
2. **Keep sensitive data** in `.env` file
3. **Use descriptive task names** and descriptions
4. **Include error handling** for critical operations
5. **Document complex tasks** with comments
6. **Use internal tasks** for helper functions
7. **Test workflows** before automation

## Extensions

### Custom Tasks

Add project-specific tasks in `Taskfile.local.yml`:

```yaml
# Taskfile.local.yml
tasks:
  deploy:
    desc: "Deploy to production"
    cmds:
      - task: backup
      - docker-compose -f docker-compose.prod.yml up -d
```

### Task Dependencies

```yaml
# Complex workflow with dependencies
migrate:
  desc: "Run database migrations"
  deps: [start]
  cmds:
    - docker-compose exec n8n npx knex migrate:latest
```

This Taskfile provides a complete automation layer for the entire Agent Flow system, from infrastructure to workflow execution.
