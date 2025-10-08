# Agent Flow Documentation

> **Complete guide to Agent Flow: AI-Powered Development Automation**

Welcome to the comprehensive documentation for Agent Flow, a powerful platform that combines Cursor CLI's AI capabilities with N8N's workflow automation to create intelligent development processes.

## 📚 Documentation Overview

### 🚀 **Getting Started**
- **[Quick Start Guide](#quick-start)** - Get up and running in minutes
- **[Prerequisites](#prerequisites)** - System requirements and installation
- **[Environment Setup](#environment-setup)** - Configuration and initialization

### 🛠 **Core Components**

#### **1. [Taskfile Commands](01-taskfile.md)**
Complete reference for all CLI commands and automation tasks.
- Infrastructure management (start, stop, restart)
- Development workflow commands
- N8N integration and configuration
- Workflow execution and management
- Cursor CLI integration
- System utilities and health checks

#### **2. [Docker Compose Setup](02-docker-compose.md)**
Infrastructure configuration and container orchestration.
- N8N service configuration
- PostgreSQL database setup
- Environment variables and secrets
- Port mapping and networking
- Volume management and persistence
- Health checks and monitoring

#### **3. [Custom Activities](03-custom-activities.md)**
N8N node development and integration patterns.
- Cursor Execute activity
- Cursor Parse activity  
- Cursor Validate activity
- Custom node development
- Activity configuration and parameters
- Error handling and validation

#### **4. [Workflow Development](04-workflow-code.md)**
TypeScript workflow definitions and development patterns.
- Workflow structure and types
- Code Review workflow
- Refactoring workflow
- AI Testing workflow
- Documentation workflow
- Bug Fixes workflow
- Custom workflow development

#### **5. [Cursor CLI Integration](05-cursor-cli.md)**
AI assistant configuration and usage patterns.
- Cursor CLI installation and setup
- API key configuration
- Model selection and parameters
- Command execution patterns
- Error handling and retries
- Performance optimization

### 🔧 **Advanced Topics**

#### **6. [API Reference](06-api.md)**
Health checks, metrics, and monitoring endpoints.
- Health check endpoints
- Performance metrics API
- System status endpoints
- Monitoring dashboard
- Alert configuration

#### **7. [Deployment Guide](07-deployment.md)**
Production deployment and scaling strategies.
- Production configuration
- Security considerations
- Performance tuning
- Monitoring and alerting
- Backup and recovery
- Scaling strategies

#### **8. [Troubleshooting](08-troubleshooting.md)**
Common issues, solutions, and debugging techniques.
- Installation problems
- Docker and container issues
- N8N configuration problems
- Cursor CLI integration issues
- Workflow execution errors
- Performance optimization

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** - Container orchestration
- **Node.js 18+** - Runtime environment
- **Git** - Version control
- **jq** - JSON processing utility
- **Cursor CLI** - AI coding assistant (optional)

### Installation
```bash
# 1. Clone the repository
git clone <repository-url>
cd agent-flow

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start the system
task serve

# 4. Verify installation
task utilities:health
```

### First Workflow
```bash
# List available workflows
task workflows:list-workflows

# Run a code review
task workflows:run-workflow --name="code-review" --prompt="Review this code"
```

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Taskfile      │───▶│  Docker Compose  │───▶│  N8N + PostgreSQL│
│   (CLI Layer)   │    │ (Infrastructure) │    │ (Workflow Engine)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Custom Activities│    │  Workflow Loader │    │   Cursor CLI    │
│ (N8N Integration)│    │ (TypeScript)     │    │ (AI Assistant)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Responsibilities

- **Taskfile**: CLI interface and command orchestration
- **Docker Compose**: Service containerization and networking
- **N8N**: Workflow execution engine and UI
- **PostgreSQL**: Data persistence and workflow storage
- **Custom Activities**: N8N nodes for Cursor CLI integration
- **Workflow Loader**: TypeScript workflow definition loader
- **Cursor CLI**: AI assistant for code analysis and generation

## 🎯 Use Cases

### **Code Reviews** ✅
Automated code review with intelligent feedback, security analysis, and best practice recommendations.

**Features:**
- Security vulnerability detection
- Code quality analysis
- Performance optimization suggestions
- Best practice recommendations
- Automated PR comments

### **Refactoring** ✅
Batch code modernization, optimization, and architectural improvements.

**Features:**
- Legacy code modernization
- Performance optimization
- Architectural improvements
- Code style standardization
- Dependency updates

### **AI Testing** ✅
Generate comprehensive test suites with coverage reports and edge case testing.

**Features:**
- Unit test generation
- Integration test creation
- Edge case testing
- Coverage analysis
- Test optimization

### **Documentation** ✅
Auto-updating READMEs, API documentation, and code comments.

**Features:**
- README generation
- API documentation
- Code comments
- Architecture diagrams
- Usage examples

### **Bug Fixes** ✅
Intelligent debugging, error analysis, and automated patch generation.

**Features:**
- Error analysis
- Root cause identification
- Patch generation
- Regression testing
- Performance impact analysis

## 🔧 Configuration

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

### Workflow Configuration
Workflows are defined in TypeScript and automatically loaded from `src/workflow-definitions/workflows/definitions/`.

## 📊 Monitoring & Observability

### Health Checks
- **System Health**: `task utilities:health`
- **API Health**: `task utilities:health-api`
- **Service Status**: `task infrastructure:status`

### Logging
- **Structured Logs**: Winston-based logging with multiple levels
- **Log Files**: Stored in `logs/` directory
- **Real-time Logs**: `task logs`

### Metrics
- **Performance Metrics**: Execution time tracking
- **System Metrics**: Resource usage monitoring
- **Workflow Metrics**: Success rates and error tracking

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: This comprehensive guide
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Version:** 1.0.0 | **Status:** Production Ready | **License:** MIT