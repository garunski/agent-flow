# Taskfile Commands Reference

> **Complete guide to Agent Flow's CLI automation system**

The Taskfile system provides a unified command-line interface for managing all aspects of Agent Flow. All commands are organized into logical modules for easy navigation and usage.

## 📋 Command Overview

### Quick Reference
```bash
# Essential commands
task serve                    # Start development server
task utilities:health        # Check system health
task workflows:list-workflows # List available workflows
task workflows:run-workflow  # Execute a workflow
task logs                    # View service logs
task ui                      # Open N8N UI
```

## 🏗 Infrastructure Commands

### Service Management
```bash
# Start all services
task infrastructure:start
# or
task up

# Stop all services  
task infrastructure:stop
# or
task down

# Restart all services
task infrastructure:restart

# Show service status
task infrastructure:status
```

### Complete Setup
```bash
# Complete setup: build, start services, and configure
task infrastructure:setup
# or
task build
```

**What it does:**
- Builds custom activities
- Starts N8N and PostgreSQL services
- Configures N8N settings
- Sets up database schema
- Validates system health

## 🚀 Development Commands

### Development Environment
```bash
# Start development environment with hot reload
task development:dev
# or
task serve

# Watch activity files for changes
task development:watch-activities

# Watch workflow files for changes
task development:watch-workflows
```

### Hot Reload Features
- **Activity Changes**: Automatically rebuilds and reloads custom activities
- **Workflow Changes**: Automatically reloads workflow definitions
- **Configuration Changes**: Restarts services when needed
- **Error Recovery**: Automatic retry on build failures

## 🤖 Cursor CLI Commands

### Direct Cursor CLI Usage
```bash
# Execute Cursor CLI command
task cursor:cursor --prompt="Your prompt here"

# Run code review with Cursor CLI
task cursor:cursor:review --prompt="Review this code"

# Run refactoring with Cursor CLI
task cursor:cursor:refactor --prompt="Refactor this function"

# Generate tests with Cursor CLI
task cursor:cursor:test --prompt="Generate tests for this code"

# Update documentation with Cursor CLI
task cursor:cursor:docs --prompt="Document this API"

# Start interactive Cursor CLI session
task cursor:cursor:interactive
```

### Cursor CLI Configuration
- **Model**: Configured via `CURSOR_MODEL` environment variable
- **Timeout**: Set via `CURSOR_TIMEOUT` environment variable
- **API Key**: Required via `CURSOR_API_KEY` environment variable

## ⚡ Workflow Commands

### Workflow Management
```bash
# List available workflows
task workflows:list-workflows

# Execute a specific workflow
task workflows:run-workflow --name="code-review" --prompt="Review this code"

# Trigger workflow by name (alternative syntax)
task workflows:trigger-workflow --name="refactoring" --prompt="Refactor this code"
```

### Available Workflows
- **code-review** - Automated code review with AI feedback
- **refactoring** - Batch code modernization and optimization
- **ai-testing** - Generate comprehensive test suites
- **documentation** - Auto-updating documentation
- **bug-fixes** - Intelligent debugging and patch generation

### Workflow Parameters
- **--name**: Workflow name (required)
- **--prompt**: Input prompt for the workflow (required)
- **--file**: Specific file to process (optional)
- **--output**: Output directory (optional)

## 🔧 N8N Commands

### N8N Management
```bash
# Open N8N UI in browser
task n8n:ui
# or
task ui

# Show N8N logs
task n8n:logs

# Show database logs
task n8n:logs:db

# Configure N8N settings
task n8n:configure-n8n
```

### Activity Management
```bash
# Build custom activities
task n8n:build-activities

# Reload custom activities
task n8n:reload-activities

# Reload workflows from code
task n8n:reload-workflows
```

### N8N Configuration
- **URL**: http://localhost:5678
- **Authentication**: Basic auth (admin/password from .env)
- **Database**: PostgreSQL (configured automatically)

## 🛠 Management Commands

### Data Management
```bash
# Backup workflows and data
task management:backup

# Restore from backup
task management:restore

# Clean all containers, volumes, and build cache
task management:clean

# Reset everything to clean state
task management:reset
```

### Backup Features
- **Workflow Definitions**: All TypeScript workflow files
- **N8N Data**: Workflow executions and configurations
- **Database**: PostgreSQL data and schemas
- **Custom Activities**: Built N8N nodes

## 🔍 Utility Commands

### System Health
```bash
# Check system health
task utilities:health

# Start development server
task utilities:serve

# Verify system setup and requirements
task utilities:verify-setup
```

### Health Check Details
- **N8N Health**: Service availability and response time
- **PostgreSQL Health**: Database connectivity and status
- **Cursor CLI**: CLI availability and version
- **Docker Services**: Container status and resource usage

## 📊 Logging Commands

### Log Management
```bash
# View service logs
task logs

# View N8N logs
task n8n:logs

# View database logs
task n8n:logs:db
```

### Log Features
- **Real-time Logs**: Live streaming of service logs
- **Structured Logging**: JSON-formatted logs with levels
- **Log Rotation**: Automatic log file management
- **Error Tracking**: Detailed error information and stack traces

## 🎯 Common Workflows

### Daily Development
```bash
# Start your day
task serve

# Check system health
task utilities:health

# Run a code review
task workflows:run-workflow --name="code-review" --prompt="Review this PR"

# View logs if needed
task logs
```

### Workflow Development
```bash
# Start development environment
task development:dev

# Watch for changes
task development:watch-workflows

# Test your workflow
task workflows:run-workflow --name="your-workflow" --prompt="Test prompt"

# Check N8N UI
task ui
```

### System Maintenance
```bash
# Check system status
task infrastructure:status

# Backup data
task management:backup

# Clean up if needed
task management:clean

# Restart services
task infrastructure:restart
```

## ⚙️ Configuration

### Environment Variables
```bash
# N8N Configuration
N8N_PASSWORD=your_secure_password
N8N_BASIC_AUTH_USER=admin

# Database Configuration
DB_PASSWORD=your_db_password

# Cursor CLI Configuration
CURSOR_API_KEY=your_cursor_api_key
CURSOR_MODEL=claude-4-sonnet
CURSOR_TIMEOUT=300
```

### Taskfile Structure
```
Taskfile.yml                 # Main entry point
tasks/
├── Taskfile.infrastructure.yml  # Infrastructure commands
├── Taskfile.development.yml     # Development commands
├── Taskfile.n8n.yml            # N8N-specific commands
├── Taskfile.workflows.yml      # Workflow commands
├── Taskfile.cursor.yml         # Cursor CLI commands
├── Taskfile.management.yml     # Management commands
└── Taskfile.utilities.yml      # Utility commands
```

## 🚨 Troubleshooting

### Common Issues

#### Command Not Found
```bash
# Check if task is installed
task --version

# Check available commands
task --list
```

#### Service Won't Start
```bash
# Check Docker status
docker ps

# Check service logs
task logs

# Restart services
task infrastructure:restart
```

#### Workflow Execution Fails
```bash
# Check N8N health
task utilities:health

# Check workflow definition
task workflows:list-workflows

# View detailed logs
task n8n:logs
```

### Debug Mode
```bash
# Enable verbose logging
export TASK_VERBOSE=1
task your-command
```

## 📚 Additional Resources

- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Cursor CLI Integration](05-cursor-cli.md)** - AI assistant configuration
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07