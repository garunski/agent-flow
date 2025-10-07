# Taskfile Commands

Unified command-line interface for the entire Agent Flow system.

## Overview

Taskfile provides simple, powerful commands for:
- **Infrastructure Management** - Start, stop, and manage Docker services
- **Development Workflow** - Hot reload and file watching
- **N8N Operations** - UI access, logging, and configuration
- **Workflow Execution** - Run and manage AI workflows
- **Cursor CLI** - Execute AI coding commands
- **Project Management** - Backup, restore, and cleanup

## Quick Start

```bash
# Setup everything
task setup

# Start development environment
task serve

# Run a workflow
task run-workflow --name="code-review" --prompt="Review this code"

# Check system health
task health
```

## Available Commands

### Infrastructure
- `task setup` - Complete system setup
- `task start` / `task stop` - Service management
- `task status` - Show running services

### Development
- `task serve` - Start with hot reload
- `task dev` - Development mode with watchers

### N8N Management
- `task ui` - Open N8N web interface
- `task logs` - View N8N logs
- `task configure-n8n` - Setup N8N configuration

### Workflow Operations
- `task run-workflow` - Execute specific workflows
- `task list-workflows` - Show available workflows
- `task reload-workflows` - Update workflow definitions

### Cursor CLI
- `task cursor` - Execute AI commands
- `task cursor:review` - Run code reviews
- `task cursor:refactor` - Refactor code
- `task cursor:test` - Generate tests

### Project Management
- `task clean` - Clean up containers and cache
- `task reset` - Reset to clean state
- `task backup` / `task restore` - Data management

## Configuration

The system uses environment variables for configuration:

```bash
# .env file
N8N_PASSWORD=your_secure_password
DB_PASSWORD=your_db_password
CURSOR_API_KEY=your_cursor_api_key
```

## Common Workflows

### Code Review Automation
```bash
# Setup and start
task setup && task serve

# Run code review
task run-workflow --name="code-review" \
  --prompt="Review this code for security and best practices"

# View results
task logs
```

### Development Workflow
```bash
# Start development environment
task serve

# Make changes to workflows
# Files are watched and auto-reloaded

# Test workflows
task run-workflow --name="test-workflow"
```

### Maintenance
```bash
# Check system health
task health

# Backup workflows
task backup

# Clean up
task clean
```

## Integration

The Taskfile integrates with:
- **Docker Compose** for infrastructure
- **N8N** for workflow orchestration
- **Cursor CLI** for AI coding
- **Git** for version control

## Best Practices

1. **Start with `task setup`** for initial configuration
2. **Use `task serve`** for development with hot reload
3. **Check `task health`** before running workflows
4. **Use `task logs`** for debugging issues
5. **Keep environment variables** in `.env` file

This Taskfile provides a complete, production-ready command interface for the entire Agent Flow system.
