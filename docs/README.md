# Agent Flow Documentation

Complete documentation for the Agent Flow system - automating Cursor CLI with N8N workflows.

## Documentation Structure

This documentation is organized into focused, practical sections:

### Core Components

1. **[Taskfile Commands](01-taskfile.md)** - Unified CLI automation with Task
   - Complete Taskfile.yml with 40+ tasks
   - Infrastructure management (Docker Compose)
   - N8N workflow orchestration
   - Development workflow automation

2. **[Docker Compose Setup](02-docker-compose.md)** - Local infrastructure
   - Simple docker-compose.yml for development
   - N8N + PostgreSQL stack configuration
   - Development integration and troubleshooting

3. **[Custom N8N Activities](03-custom-activities.md)** - Integration nodes
   - CursorExecute, CursorParse, CursorValidate activities
   - Complete implementations with TypeScript
   - Development, testing, and deployment

4. **[Code-Defined Workflows](04-workflow-code.md)** - TypeScript workflows
   - Type-safe workflow definitions
   - Auto-loading and hot reload system
   - Complete examples (code review, refactoring, testing)

5. **[Cursor CLI Manual](05-cursor-cli.md)** - Direct usage guide
   - Installation and basic usage
   - Custom commands integration
   - MCP server setup and slash commands

## Quick Reference

### Setup (One Command)
```bash
# Install prerequisites, setup infrastructure, start services
task setup
```

### Development Workflow
```bash
# Start development environment with hot reload
task dev

# Run specific workflow
task run-workflow --name="code-review" --prompt="Review this code"

# Check system health
task health

# View logs
task logs
```

### Key Features
- ✅ **Type-Safe Workflows** - TypeScript definitions with validation
- ✅ **Hot Reload** - Automatic updates during development
- ✅ **Custom Commands** - Project-specific Cursor CLI commands
- ✅ **Production Ready** - Error handling, caching, monitoring
- ✅ **CI/CD Integration** - Automated deployment pipelines

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Taskfile      │───▶│  Docker Compose  │───▶│   N8N + DB      │
│   (CLI Layer)   │    │  (Infrastructure)│    │  (Workflows)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Custom Activities│◀───│Code-Defined      │◀───│  Cursor CLI     │
│   (Integration)  │    │  Workflows       │    │   (AI Engine)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Getting Started

1. **Install Prerequisites** - Docker, Task, Node.js (see [01-taskfile.md](01-taskfile.md#prerequisites-installation))
2. **Setup Infrastructure** - `task setup` (starts N8N + PostgreSQL)
3. **Explore Workflows** - Open http://localhost:5678 and import workflows
4. **Run Examples** - Use `task run-workflow` to test automation
5. **Customize** - Modify workflows in TypeScript for your needs

## Advanced Usage

- **Custom Commands** - Create project-specific Cursor CLI commands
- **CI/CD Integration** - Automated deployment with GitHub Actions
- **Monitoring** - Health checks, logging, and performance metrics
- **Scaling** - Queue mode and horizontal scaling for production

## Support

- 📖 **[Full Documentation](#)** - Each section above is comprehensively documented
- 🔧 **Troubleshooting** - Common issues covered in each section
- 🚀 **Examples** - Real workflow implementations and use cases
- 💡 **Best Practices** - Guidelines for production deployment

---

**Version:** 1.0.0 | **Updated:** January 2025
