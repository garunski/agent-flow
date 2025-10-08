# Agent Flow: AI-Powered Development Automation

> **Transform your development workflow with intelligent automation using Cursor CLI and N8N**

Agent Flow is a comprehensive local development platform that combines the power of Cursor CLI's AI capabilities with N8N's workflow automation to create intelligent, automated development processes. Build, test, review, and deploy code with AI assistance through configurable workflows.

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd agent-flow
cp .env.example .env

# 2. Install prerequisites
# See Prerequisites section below

# 3. Start the system
task serve

# 4. Access N8N UI
open http://localhost:5678

# 5. Run your first workflow
task workflows:run-workflow --name="code-review" --prompt="Review this code"
```

## ✨ Key Features

### 🤖 **AI-Powered Workflows**
- **Code Review** - Automated PR reviews with intelligent feedback
- **Refactoring** - Batch code modernization and optimization  
- **AI Testing** - Generate comprehensive test suites with coverage
- **Documentation** - Auto-updating READMEs and API documentation
- **Bug Fixes** - Intelligent debugging and automated patch generation

### 🛠 **Developer Experience**
- **Type-Safe Workflows** - Define workflows in TypeScript with full validation
- **Hot Reload** - Automatic workflow updates during development
- **Local Development** - Comprehensive error handling and logging
- **Docker Integration** - Containerized N8N and PostgreSQL setup
- **Health Monitoring** - Real-time system status and performance metrics

### 🔧 **Production Ready**
- **Structured Logging** - Winston-based logging with multiple levels
- **Performance Metrics** - Execution time tracking and monitoring
- **Health Checks** - API endpoints for system monitoring
- **Error Recovery** - Retry mechanisms and graceful failure handling
- **Configuration Management** - Environment-based configuration

## 🏗 Architecture

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

## 📚 Documentation

### Core Guides
- **[📋 Taskfile Commands](docs/01-taskfile.md)** - Complete CLI reference
- **[🐳 Docker Setup](docs/02-docker-compose.md)** - Infrastructure configuration
- **[🔌 Custom Activities](docs/03-custom-activities.md)** - N8N node development
- **[⚡ Workflow Development](docs/04-workflow-code.md)** - TypeScript workflow definitions
- **[🤖 Cursor CLI Integration](docs/05-cursor-cli.md)** - AI assistant configuration

### Additional Resources
- **[🔧 Troubleshooting](docs/08-troubleshooting.md)** - Common issues and solutions
- **[📊 API Reference](docs/06-api.md)** - Health and metrics endpoints
- **[🚀 Deployment Guide](docs/07-deployment.md)** - Production setup
- **[📈 Monitoring](docs/09-monitoring.md)** - Logging and metrics

## 🎯 Use Cases

### **Code Reviews** ✅ *Available*
Automated code review with intelligent feedback, security analysis, and best practice recommendations.

```bash
task workflows:run-workflow --name="code-review" --prompt="Review this React component"
```

### **Refactoring** ✅ *Available*
Batch code modernization, optimization, and architectural improvements.

```bash
task workflows:run-workflow --name="refactoring" --prompt="Refactor this legacy code"
```

### **AI Testing** ✅ *Available*
Generate comprehensive test suites with coverage reports and edge case testing.

```bash
task workflows:run-workflow --name="ai-testing" --prompt="Generate tests for this function"
```

### **Documentation** ✅ *Available*
Auto-updating READMEs, API documentation, and code comments.

```bash
task workflows:run-workflow --name="documentation" --prompt="Document this API"
```

### **Bug Fixes** ✅ *Available*
Intelligent debugging, error analysis, and automated patch generation.

```bash
task workflows:run-workflow --name="bug-fixes" --prompt="Fix this error"
```

## 🛠 Prerequisites

### Required
- **Docker & Docker Compose** - Container orchestration
- **Node.js 18+** - Runtime environment
- **Git** - Version control
- **jq** - JSON processing utility

### Optional
- **Cursor CLI** - AI coding assistant (subscription required)
- **VS Code** - Recommended editor with Cursor extension

### Installation Commands

```bash
# macOS (using Homebrew)
brew install docker docker-compose node jq

# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose nodejs npm jq

# Windows (using Chocolatey)
choco install docker-desktop nodejs jq
```

## ⚙️ Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agent-flow
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the system**
   ```bash
   task serve
   ```

4. **Verify installation**
   ```bash
   task utilities:health
   ```

## 🚀 Getting Started

### 1. **Start Development Server**
```bash
task serve
```
This starts N8N, PostgreSQL, and all required services.

### 2. **Access N8N UI**
Open http://localhost:5678 in your browser and log in with the credentials from your `.env` file.

### 3. **Run Your First Workflow**
```bash
# List available workflows
task workflows:list-workflows

# Run a specific workflow
task workflows:run-workflow --name="code-review" --prompt="Review this code"
```

### 4. **Monitor System Health**
```bash
# Check system status
task utilities:health

# View logs
task logs

# Check API health
task utilities:health-api
```

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

- **Documentation**: [docs/](docs/) - Complete setup and usage guides
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues) - Bug reports and feature requests

---

**Version:** 1.0.0 | **Status:** Production Ready | **License:** MIT