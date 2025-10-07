# Agent Flow: Cursor CLI + N8N Automation

A streamlined, production-ready system for automating AI-powered code development workflows.

## Quick Start

```bash
# 1. Install prerequisites (Docker, Task, Node.js)
# See docs/01-taskfile.md for installation commands

# 2. Setup and start everything
task setup

# 3. Open N8N UI
task ui

# 4. Run a workflow
task run-workflow --name="code-review" --prompt="Review this code"

# 5. View results
task logs
```

## Documentation

📚 **[Complete Documentation](docs/)** - Detailed guides for each component

### Core Components

1. **[Taskfile Commands](docs/01-taskfile.md)** - Unified CLI automation
2. **[Docker Compose](docs/02-docker-compose.md)** - Local N8N + PostgreSQL setup
3. **[Custom Activities](docs/03-custom-activities.md)** - N8N nodes for Cursor CLI
4. **[Code-Defined Workflows](docs/04-workflow-code.md)** - TypeScript workflow definitions
5. **[Cursor CLI Manual](docs/05-cursor-cli.md)** - Direct Cursor CLI usage

## Architecture

```
Taskfile → Docker Compose → N8N + PostgreSQL → Custom Activities → Cursor CLI
    ↓            ↓              ↓                    ↓              ↓
CLI Layer   Infrastructure   Workflow Engine    Integration     AI Assistant
```

## Key Features

✅ **Type-Safe Workflows** - Define workflows in TypeScript with full validation
✅ **Hot Reload** - Automatic workflow updates during development
✅ **Custom Commands** - Project-specific slash commands in Cursor CLI
✅ **Production Ready** - Comprehensive error handling and logging
✅ **CI/CD Integration** - Automated deployment and testing
✅ **Enterprise Security** - Proper authentication and access controls

## Use Cases

🚀 **Code Reviews** - Automated PR reviews with AI feedback
🔄 **Refactoring** - Batch code modernization and optimization
🧪 **Testing** - AI-generated test suites with coverage reports
📝 **Documentation** - Auto-updating READMEs and API docs
🔧 **Bug Fixes** - Intelligent debugging and patch generation

## Requirements

- **Docker & Docker Compose** - For containerized deployment
- **Node.js 18+** - For development and N8N
- **Cursor CLI** - AI coding assistant (subscription required)
- **Git** - For workflow version control

## Getting Help

- 📖 **[Full Documentation](docs/)** - Complete setup guides
- 🔧 **[Troubleshooting](docs/03-custom-activities.md#troubleshooting)** - Common issues and solutions
- 🚀 **[Examples](docs/04-workflow-code.md#workflow-definitions)** - Real workflow implementations
- 💬 **Community** - Join discussions on workflow automation

---

**Version:** 1.0.0 | **License:** MIT
