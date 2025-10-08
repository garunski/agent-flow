# Docker Compose Configuration

> **Complete guide to Agent Flow's containerized infrastructure**

Agent Flow uses Docker Compose to orchestrate N8N and PostgreSQL services, providing a consistent and isolated development environment.

## 🐳 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   Host Machine  │    │   Docker Network │
│                 │    │                  │
│  ┌─────────────┐│    │ ┌──────────────┐ │
│  │ Taskfile    ││───▶│ │ N8N Service  │ │
│  │ (CLI)       ││    │ │ Port: 5678   │ │
│  └─────────────┘│    │ └──────────────┘ │
│                 │    │        │         │
│  ┌─────────────┐│    │ ┌──────────────┐ │
│  │ Source Code ││───▶│ │ PostgreSQL   │ │
│  │ (Volumes)   ││    │ │ Port: 5432   │ │
│  └─────────────┘│    │ └──────────────┘ │
└─────────────────┘    └──────────────────┘
```

## 📋 Service Configuration

### N8N Service

#### Image and Version
```yaml
n8n:
  image: n8nio/n8n:1.65.0  # Pinned version for stability
```

**Why pinned version?**
- Ensures consistent behavior across environments
- Prevents breaking changes from automatic updates
- Provides predictable upgrade path

#### Port Configuration
```yaml
ports:
  - "5678:5678"  # Host:Container port mapping
```

**Access Points:**
- **N8N UI**: http://localhost:5678
- **Health Check**: http://localhost:5678/healthz

#### Volume Mounts
```yaml
volumes:
  - ~/.n8n:/home/node/.n8n                    # N8N data persistence
  - ./src/workflow-definitions:/home/node/workflows:ro  # Workflow definitions
  - ./src/n8n-nodes:/home/node/activities:ro  # Custom activities
```

**Volume Purposes:**
- **~/.n8n**: Persists N8N configurations, workflows, and execution data
- **workflow-definitions**: Read-only access to TypeScript workflow definitions
- **n8n-nodes**: Read-only access to custom N8N activities

#### Environment Variables
```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=password
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PORT=5432
  - DB_POSTGRESDB_DATABASE=n8n
  - DB_POSTGRESDB_USER=n8n
  - DB_POSTGRESDB_PASSWORD=password
  - N8N_LOG_LEVEL=debug
```

**Configuration Details:**
- **Authentication**: Basic auth enabled for local development
- **Database**: PostgreSQL connection configuration
- **Logging**: Debug level for development troubleshooting

### PostgreSQL Service

#### Image and Version
```yaml
postgres:
  image: postgres:15-alpine  # Lightweight Alpine-based PostgreSQL
```

**Why Alpine?**
- Smaller image size
- Better security profile
- Faster startup times

#### Port Configuration
```yaml
ports:
  - "5432:5432"  # Standard PostgreSQL port
```

**Access Points:**
- **Direct Connection**: localhost:5432
- **Database**: n8n
- **User**: n8n

#### Volume Mounts
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data  # Data persistence
```

**Data Persistence:**
- **Volume**: `postgres_data` (Docker managed)
- **Location**: `/var/lib/postgresql/data`
- **Purpose**: Persists database data across container restarts

#### Environment Variables
```yaml
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_USER=n8n
  - POSTGRES_PASSWORD=password
```

**Database Configuration:**
- **Database Name**: n8n
- **Username**: n8n
- **Password**: password (change in production)

## 🔧 Configuration Management

### Environment Variables

#### Required Variables
```bash
# N8N Configuration
N8N_PASSWORD=your_secure_password
N8N_BASIC_AUTH_USER=admin

# Database Configuration
DB_PASSWORD=your_db_password

# Cursor CLI Configuration (Optional)
CURSOR_API_KEY=your_cursor_api_key
```

#### Environment File Setup
```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

### Volume Management

#### Data Volumes
```yaml
volumes:
  postgres_data:
    driver: local
```

**Volume Types:**
- **postgres_data**: Persistent storage for database
- **~/.n8n**: Host directory for N8N data
- **Source Code**: Bind mounts for development

#### Volume Backup
```bash
# Backup PostgreSQL data
docker run --rm -v agent-flow_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore PostgreSQL data
docker run --rm -v agent-flow_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🚀 Service Management

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d n8n
docker-compose up -d postgres
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Service Status
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs n8n
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f n8n
```

### Service Restart
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart n8n
```

## 🔍 Health Monitoring

### Health Checks

#### N8N Health
```bash
# Check N8N health endpoint
curl http://localhost:5678/healthz

# Expected response: OK
```

#### PostgreSQL Health
```bash
# Check PostgreSQL connectivity
docker-compose exec postgres pg_isready -U n8n

# Expected response: postgres:5432 - accepting connections
```

#### Service Status
```bash
# Check all services
docker-compose ps

# Expected output:
# Name                Command               State           Ports
# -------------------------------------------------------------------------------
# agent-flow_n8n_1   /usr/local/bin/docker-entrypoint.sh   Up      0.0.0.0:5678->5678/tcp
# agent-flow_postgres_1   docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
```

### Log Monitoring

#### N8N Logs
```bash
# View N8N logs
docker-compose logs n8n

# Follow N8N logs
docker-compose logs -f n8n

# View last 100 lines
docker-compose logs --tail=100 n8n
```

#### PostgreSQL Logs
```bash
# View PostgreSQL logs
docker-compose logs postgres

# Follow PostgreSQL logs
docker-compose logs -f postgres
```

## 🛠 Development Workflow

### Hot Reload Setup
```bash
# Start with file watching
docker-compose up -d

# Watch for changes
task development:watch-workflows
task development:watch-activities
```

### Code Changes
```bash
# Workflow changes are automatically loaded
# Activity changes require rebuild
task n8n:build-activities
task n8n:reload-activities
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U n8n -d n8n

# Run SQL queries
docker-compose exec postgres psql -U n8n -d n8n -c "SELECT * FROM workflow_entity;"
```

## 🔒 Security Considerations

### Production Security
```yaml
# Use strong passwords
environment:
  - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
  - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}

# Disable debug logging
environment:
  - N8N_LOG_LEVEL=info
```

### Network Security
```yaml
# Use custom network
networks:
  agent-flow:
    driver: bridge

# Restrict port exposure
ports:
  - "127.0.0.1:5678:5678"  # Only localhost access
```

### Data Security
```yaml
# Use secrets for sensitive data
secrets:
  n8n_password:
    file: ./secrets/n8n_password.txt
  db_password:
    file: ./secrets/db_password.txt
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -i :5678
lsof -i :5432

# Kill conflicting processes
sudo kill -9 $(lsof -t -i:5678)
```

#### Permission Issues
```bash
# Fix volume permissions
sudo chown -R 1000:1000 ~/.n8n
```

#### Service Won't Start
```bash
# Check Docker status
docker --version
docker-compose --version

# Check service logs
docker-compose logs n8n
docker-compose logs postgres
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U n8n

# Check database exists
docker-compose exec postgres psql -U n8n -l
```

### Debug Mode
```bash
# Enable debug logging
export N8N_LOG_LEVEL=debug
docker-compose up
```

### Clean Restart
```bash
# Stop and remove everything
docker-compose down -v

# Remove unused images
docker system prune -a

# Start fresh
docker-compose up -d
```

## 📊 Performance Tuning

### Resource Limits
```yaml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Database Optimization
```yaml
services:
  postgres:
    command: >
      postgres
      -c shared_buffers=256MB
      -c max_connections=100
      -c effective_cache_size=1GB
```

### Logging Configuration
```yaml
services:
  n8n:
    environment:
      - N8N_LOG_LEVEL=info  # Reduce log verbosity
      - N8N_LOG_OUTPUT=file  # Log to file instead of console
```

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07