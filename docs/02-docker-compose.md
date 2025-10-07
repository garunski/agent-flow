# Docker Compose Setup

Simple, reliable infrastructure for local N8N development.

## Overview

Docker Compose provides a complete local development environment with:
- **N8N** - Workflow automation platform accessible at http://localhost:5678
- **PostgreSQL** - Persistent database storage
- **Volume Management** - Data persistence across restarts
- **Development Integration** - Hot reload and file watching support

## Quick Start

```bash
# Start all services
docker-compose up -d

# View N8N web interface
open http://localhost:5678

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Services

### N8N (Port 5678)
- **Web Interface**: http://localhost:5678
- **Authentication**: Basic auth enabled (admin/password)
- **Database**: Connected to PostgreSQL
- **Data Storage**: Persistent in `~/.n8n`

### PostgreSQL (Port 5432)
- **Database**: `n8n` database created automatically
- **User**: `n8n` with password `password`
- **Data Storage**: Persistent volume for database files

## Configuration

The setup uses sensible defaults - no additional configuration needed for basic usage:

```bash
# Default credentials
N8N_USER=admin
N8N_PASSWORD=password
DB_USER=n8n
DB_PASSWORD=password
```

For custom configuration, create a `.env` file:

```bash
# .env (optional)
N8N_PASSWORD=your_secure_password
DB_PASSWORD=your_db_password
N8N_LOG_LEVEL=debug
```

## Development Workflow

### Basic Development
```bash
# Start services
docker-compose up -d

# Access N8N UI
open http://localhost:5678

# View logs in real-time
docker-compose logs -f n8n

# Access database
docker-compose exec postgres psql -U n8n -d n8n
```

### With Hot Reload
```bash
# Create override file for development
cat > docker-compose.override.yml << 'EOF'
version: '3.8'
services:
  n8n:
    volumes:
      - ./workflows:/home/node/workflows:ro
      - ./activities:/home/node/activities:ro
    environment:
      - N8N_LOG_LEVEL=debug
EOF

# Start with hot reload
docker-compose up -d

# Files are watched and auto-reloaded
```

### Cursor CLI Integration
```bash
# Access N8N container
docker-compose exec n8n sh

# Install Cursor CLI inside container
curl https://cursor.com/install -fsS | bash

# Use AI commands
cursor-agent chat "Review this code for bugs"
```

## Data Management

### Persistence
All data is automatically persisted:
- **N8N workflows and settings** → `~/.n8n` directory
- **PostgreSQL database** → `postgres_data` volume

### Backup and Restore
```bash
# Backup database
docker-compose exec postgres pg_dump -U n8n n8n > backup.sql

# Restore database
docker-compose exec -T postgres psql -U n8n n8n < backup.sql

# Reset everything (WARNING: destroys data)
docker-compose down -v
```

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 5678
lsof -i :5678

# Use different port
N8N_PORT=5679 docker-compose up -d
```

**Permission issues:**
```bash
# Fix N8N data permissions
sudo chown -R $USER:$USER ~/.n8n
sudo chmod -R 755 ~/.n8n
```

**Database connection problems:**
```bash
# Check database status
docker-compose logs postgres

# Test database connection
docker-compose exec postgres pg_isready -U n8n

# Reset database
docker-compose down -v && docker-compose up -d
```

## Integration

This Docker Compose setup integrates seamlessly with:
- **Taskfile** for command-line automation
- **Custom workflows** via mounted volumes
- **Custom activities** via mounted volumes
- **Development tools** via container access

## Production Considerations

For production deployment:
- Use stronger passwords
- Configure SSL/TLS encryption
- Set up proper firewall rules
- Use external database for scalability
- Configure resource limits and monitoring

This Docker Compose setup provides a solid foundation for both development and production N8N deployments.
