# Troubleshooting Guide

> **Comprehensive guide to diagnosing and resolving common issues with Agent Flow**

This guide covers common issues, error messages, and solutions for Agent Flow. If you encounter a problem not covered here, please check the logs and consider opening an issue.

## 🚨 Quick Diagnosis

### System Health Check
```bash
# Check overall system health
task utilities:health

# Check specific services
task infrastructure:status

# Check logs
task logs
```

### Common Error Patterns
- **Port conflicts**: Services can't start
- **Permission issues**: File access denied
- **Dependency missing**: Required tools not found
- **Configuration errors**: Invalid settings
- **Network issues**: Can't connect to services

## 🔧 Installation Issues

### Prerequisites Not Found

#### Docker Not Installed
```bash
# Error: docker: command not found
# Solution: Install Docker
# macOS
brew install --cask docker

# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Windows
# Download from https://docker.com
```

#### Node.js Not Installed
```bash
# Error: node: command not found
# Solution: Install Node.js
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from https://nodejs.org
```

#### jq Not Installed
```bash
# Error: jq: command not found
# Solution: Install jq
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Windows
choco install jq
```

#### Cursor CLI Not Installed
```bash
# Error: cursor-agent: command not found
# Solution: Install Cursor CLI
npm install -g @cursor/cli

# Verify installation
cursor-agent --version
```

### Permission Issues

#### Docker Permission Denied
```bash
# Error: permission denied while trying to connect to Docker daemon
# Solution: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or restart Docker Desktop
```

#### File Permission Issues
```bash
# Error: EACCES: permission denied
# Solution: Fix file permissions
sudo chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project
```

#### N8N Data Directory Permissions
```bash
# Error: permission denied accessing ~/.n8n
# Solution: Fix N8N data directory permissions
sudo chown -R 1000:1000 ~/.n8n
chmod -R 755 ~/.n8n
```

## 🐳 Docker Issues

### Container Won't Start

#### Port Already in Use
```bash
# Error: port 5678 is already in use
# Solution: Check and kill conflicting processes
lsof -i :5678
sudo kill -9 $(lsof -t -i:5678)

# Or change port in docker-compose.yml
ports:
  - "5679:5678"  # Use different port
```

#### Insufficient Resources
```bash
# Error: container exited with code 137 (OOM)
# Solution: Increase Docker resources
# Docker Desktop: Settings > Resources > Memory
# Or add resource limits to docker-compose.yml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 2G
```

#### Volume Mount Issues
```bash
# Error: volume mount failed
# Solution: Check volume paths
docker-compose down -v
docker-compose up -d

# Or recreate volumes
docker volume prune
docker-compose up -d
```

### Container Health Issues

#### N8N Container Unhealthy
```bash
# Check N8N logs
docker-compose logs n8n

# Check N8N health
curl http://localhost:5678/healthz

# Restart N8N container
docker-compose restart n8n
```

#### PostgreSQL Container Unhealthy
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check PostgreSQL health
docker-compose exec postgres pg_isready -U n8n

# Restart PostgreSQL container
docker-compose restart postgres
```

### Database Issues

#### Connection Refused
```bash
# Error: connection refused to postgres
# Solution: Check PostgreSQL status
docker-compose exec postgres pg_isready -U n8n

# Check database exists
docker-compose exec postgres psql -U n8n -l

# Recreate database
docker-compose down -v
docker-compose up -d
```

#### Database Corruption
```bash
# Error: database is corrupted
# Solution: Restore from backup
docker-compose exec postgres pg_dump -U n8n n8n > backup.sql
docker-compose down -v
docker-compose up -d
docker-compose exec -T postgres psql -U n8n n8n < backup.sql
```

## 🔌 N8N Issues

### Workflow Execution Failures

#### Workflow Not Found
```bash
# Error: workflow not found
# Solution: Check workflow exists
task workflows:list-workflows

# Reload workflows
task n8n:reload-workflows

# Check workflow definition
ls src/workflow-definitions/workflows/definitions/
```

#### Node Execution Error
```bash
# Error: node execution failed
# Solution: Check node logs
task n8n:logs | grep "ERROR"

# Check node configuration
# Verify node parameters
# Check input data format
```

#### Custom Activity Not Found
```bash
# Error: custom activity not found
# Solution: Build and reload activities
task n8n:build-activities
task n8n:reload-activities

# Check activity files
ls src/n8n-nodes/activities/
```

### Authentication Issues

#### Login Failed
```bash
# Error: authentication failed
# Solution: Check credentials
# Verify N8N_BASIC_AUTH_USER and N8N_BASIC_AUTH_PASSWORD
# Check .env file
cat .env | grep N8N

# Reset password
docker-compose exec n8n n8n user:reset --email admin@example.com
```

#### API Key Invalid
```bash
# Error: invalid API key
# Solution: Check Cursor API key
echo $CURSOR_API_KEY

# Verify API key
cursor-agent --version

# Update API key
export CURSOR_API_KEY="your_new_api_key"
```

## 🤖 Cursor CLI Issues

### Command Execution Failures

#### Cursor CLI Not Found
```bash
# Error: cursor-agent: command not found
# Solution: Install Cursor CLI
npm install -g @cursor/cli

# Check PATH
echo $PATH
which cursor-agent

# Add to PATH
export PATH=$PATH:/usr/local/bin
```

#### API Key Not Set
```bash
# Error: API key not found
# Solution: Set API key
export CURSOR_API_KEY="your_api_key"

# Or add to .env file
echo "CURSOR_API_KEY=your_api_key" >> .env
```

#### Model Not Available
```bash
# Error: model not found
# Solution: Check available models
cursor-agent models list

# Use correct model name
cursor-agent chat "test" --model claude-4-sonnet
```

#### Timeout Issues
```bash
# Error: timeout exceeded
# Solution: Increase timeout
cursor-agent chat "complex task" --timeout 1800

# Or use faster model
cursor-agent chat "simple task" --model claude-4-haiku
```

### Response Quality Issues

#### Poor Response Quality
```bash
# Solution: Use better model
cursor-agent chat "complex task" --model claude-4-opus

# Or improve prompt
cursor-agent chat "detailed prompt with context" --model claude-4-sonnet
```

#### Response Too Long
```bash
# Solution: Limit response length
cursor-agent chat "task" --max-tokens 1000

# Or break into smaller tasks
cursor-agent chat "part 1 of task"
cursor-agent chat "part 2 of task"
```

#### Response Too Short
```bash
# Solution: Ask for more detail
cursor-agent chat "provide detailed analysis of..."

# Or use different model
cursor-agent chat "task" --model claude-4-opus
```

## 📊 Performance Issues

### Slow Workflow Execution

#### High CPU Usage
```bash
# Check CPU usage
top
htop

# Solution: Optimize workflow
# Reduce number of nodes
# Use simpler operations
# Add caching
```

#### High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Solution: Optimize memory usage
# Reduce batch sizes
# Clear unused data
# Add memory limits
```

#### Slow Database Queries
```bash
# Check database performance
docker-compose exec postgres psql -U n8n -c "SELECT * FROM pg_stat_activity;"

# Solution: Optimize database
# Add indexes
# Optimize queries
# Increase memory
```

### Network Issues

#### Slow API Calls
```bash
# Check network connectivity
ping api.cursor.sh
curl -I https://api.cursor.sh

# Solution: Check network
# Use faster connection
# Add retry logic
# Use local caching
```

#### Connection Timeouts
```bash
# Error: connection timeout
# Solution: Increase timeout
cursor-agent chat "task" --timeout 1800

# Or add retry logic
# Implement exponential backoff
```

## 🔍 Debugging Techniques

### Enable Debug Logging

#### N8N Debug Mode
```bash
# Enable N8N debug logging
export N8N_LOG_LEVEL=debug
docker-compose up

# Or add to docker-compose.yml
environment:
  - N8N_LOG_LEVEL=debug
```

#### Cursor CLI Debug Mode
```bash
# Enable Cursor CLI debug logging
export CURSOR_DEBUG=true
cursor-agent chat "test"

# Or use verbose flag
cursor-agent chat "test" --verbose
```

#### Docker Debug Mode
```bash
# Enable Docker debug logging
export DOCKER_BUILDKIT=0
docker-compose up --build
```

### Log Analysis

#### Check Service Logs
```bash
# Check all logs
task logs

# Check specific service
docker-compose logs n8n
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f n8n
```

#### Search Logs
```bash
# Search for errors
task logs | grep "ERROR"

# Search for specific text
task logs | grep "cursor-agent"

# Search with context
task logs | grep -A 5 -B 5 "ERROR"
```

#### Log Rotation
```bash
# Check log file sizes
du -sh logs/*

# Rotate logs
docker-compose logs --tail=1000 > logs/backup.log
docker-compose restart
```

### System Monitoring

#### Resource Usage
```bash
# Check system resources
htop
iotop
nethogs

# Check Docker resources
docker stats
docker system df
```

#### Network Monitoring
```bash
# Check network connections
netstat -tulpn
ss -tulpn

# Check port usage
lsof -i :5678
lsof -i :5432
```

#### Process Monitoring
```bash
# Check running processes
ps aux | grep n8n
ps aux | grep postgres
ps aux | grep cursor-agent
```

## 🛠 Common Solutions

### Reset Everything
```bash
# Complete reset
task management:reset

# Or manual reset
docker-compose down -v
docker system prune -a
rm -rf ~/.n8n
task infrastructure:setup
```

### Update Dependencies
```bash
# Update Node.js packages
npm update

# Update Docker images
docker-compose pull
docker-compose up -d

# Update Cursor CLI
npm install -g @cursor/cli@latest
```

### Backup and Restore
```bash
# Backup data
task management:backup

# Restore data
task management:restore

# Manual backup
docker-compose exec postgres pg_dump -U n8n n8n > backup.sql
cp -r ~/.n8n n8n-backup/
```

### Configuration Reset
```bash
# Reset N8N configuration
rm -rf ~/.n8n
docker-compose restart n8n

# Reset environment
cp .env.example .env
# Edit .env with your values
```

## 📞 Getting Help

### Before Asking for Help

1. **Check this guide** - Look for your specific error
2. **Check logs** - Look for error messages
3. **Check system health** - Run `task utilities:health`
4. **Check configuration** - Verify your settings
5. **Try common solutions** - Reset, restart, update

### Information to Include

When asking for help, include:

1. **Error message** - Exact error text
2. **System information** - OS, Docker version, Node.js version
3. **Configuration** - Relevant settings (without sensitive data)
4. **Logs** - Relevant log entries
5. **Steps to reproduce** - What you did before the error

### Useful Commands for Debugging

```bash
# System information
uname -a
docker --version
node --version
npm --version

# Service status
task infrastructure:status
docker-compose ps

# Health checks
task utilities:health
curl http://localhost:5678/healthz

# Logs
task logs | tail -100
docker-compose logs --tail=100
```

### Community Resources

- **GitHub Issues** - Report bugs and request features
- **Documentation** - Check the complete docs
- **Discord/Slack** - Community support
- **Stack Overflow** - Technical questions

## 🚀 Performance Optimization

### System Optimization

#### Docker Optimization
```bash
# Increase Docker resources
# Docker Desktop: Settings > Resources
# Memory: 4GB+
# CPU: 2+ cores
# Disk: 20GB+
```

#### Database Optimization
```yaml
# Add to docker-compose.yml
services:
  postgres:
    command: >
      postgres
      -c shared_buffers=256MB
      -c max_connections=100
      -c effective_cache_size=1GB
```

#### N8N Optimization
```yaml
# Add to docker-compose.yml
services:
  n8n:
    environment:
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=file
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

### Workflow Optimization

#### Reduce Node Count
- Combine similar operations
- Use more efficient nodes
- Remove unnecessary nodes

#### Optimize Data Processing
- Process data in smaller batches
- Use streaming for large datasets
- Cache frequently used data

#### Add Error Handling
- Implement retry logic
- Add fallback mechanisms
- Use conditional logic

### Monitoring and Alerting

#### Health Checks
```bash
# Regular health checks
task utilities:health

# Automated monitoring
# Add to cron job
*/5 * * * * cd /path/to/agent-flow && task utilities:health
```

#### Log Monitoring
```bash
# Monitor logs for errors
tail -f logs/n8n.log | grep ERROR

# Set up log rotation
# Add to logrotate configuration
```

#### Performance Metrics
```bash
# Monitor resource usage
docker stats --no-stream

# Monitor workflow execution
# Check N8N execution history
```

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07