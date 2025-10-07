# Docker Compose Setup

Local development environment for N8N + PostgreSQL.

## Overview

Simple Docker Compose setup for local development providing:
- **N8N**: Workflow automation platform (localhost:5678)
- **PostgreSQL**: Local database storage
- **Volumes**: Data persistence across restarts
- **Development**: Hot reload and file watching

## Complete Docker Compose Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ./workflows:/home/node/workflows:ro
      - ./activities:/home/node/activities:ro
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
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=password
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```


## Services Configuration

### N8N Service

**Configuration:**
- **Image**: `n8nio/n8n:latest`
- **Port**: 5678 → http://localhost:5678
- **Authentication**: Basic auth (admin/password)
- **Database**: PostgreSQL connection

**Volumes:**
- `~/.n8n` → N8N data persistence
- `./workflows` → Custom workflow definitions
- `./activities` → Custom activity nodes

### PostgreSQL Service

**Configuration:**
- **Image**: `postgres:15-alpine`
- **Port**: 5432 → localhost:5432
- **Database**: `n8n`
- **User**: `n8n`

**Volumes:**
- `postgres_data` → Database persistence

## Environment Configuration

The Docker Compose file uses simple default values - no .env file needed for basic setup:

```yaml
# Default values in docker-compose.yml
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=password
```

For customization, create a `.env` file:

```bash
# .env (optional)
N8N_BASIC_AUTH_PASSWORD=your_password
POSTGRES_PASSWORD=your_db_password
N8N_LOG_LEVEL=debug
```

## Quick Start Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove everything (including data)
docker-compose down -v
```

### Development Workflow

```bash
# Start and view N8N UI
docker-compose up -d
open http://localhost:5678

# Access containers
docker-compose exec n8n sh
docker-compose exec postgres psql -U n8n -d n8n

# Rebuild after changes
docker-compose up -d --build

# Restart specific service
docker-compose restart n8n
```

## Development Integration

### File Watching and Hot Reload

For development with hot reload, create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  n8n:
    volumes:
      - ./workflows:/home/node/workflows:ro
      - ./activities:/home/node/activities:ro
    environment:
      - N8N_LOG_LEVEL=debug
```

### Cursor CLI Integration

To use Cursor CLI inside the N8N container:

```bash
# Access N8N container
docker-compose exec n8n sh

# Install Cursor CLI inside container
curl https://cursor.com/install -fsS | bash

# Use Cursor CLI
cursor-agent chat "Review this code"
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using port 5678
lsof -i :5678

# Kill process or change port
kill -9 <PID>
# or
N8N_PORT=5679 docker-compose up -d
```

**Permission denied on ~/.n8n:**
```bash
sudo chown -R $USER:$USER ~/.n8n
sudo chmod -R 755 ~/.n8n
```

**Database connection failed:**
```bash
# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U n8n

# Reset everything
docker-compose down -v
docker-compose up -d
```

**N8N won't start:**
```bash
# Check logs
docker-compose logs n8n

# Debug mode
N8N_LOG_LEVEL=debug docker-compose up -d
```

## Integration Examples

### With Taskfile

```bash
# Via Taskfile (see 01-taskfile.md)
task setup   # Start services
task logs    # View logs
task stop    # Stop services
```

### With Custom Workflows

```yaml
# Mount in docker-compose.yml
volumes:
  - ./workflows:/home/node/workflows:ro
```

### With Custom Activities

```yaml
# Mount in docker-compose.yml
volumes:
  - ./activities:/home/node/activities:ro
```

## Data Persistence

All data persists in Docker volumes:
- `~/.n8n` → N8N workflows and settings
- `postgres_data` → PostgreSQL database

To reset everything:
```bash
docker-compose down -v
```

This simple Docker Compose setup provides everything needed for local N8N development with PostgreSQL.
