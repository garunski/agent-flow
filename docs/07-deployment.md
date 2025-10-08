# Deployment Guide

> **Complete guide to deploying Agent Flow in production environments**

This guide covers production deployment strategies, security considerations, performance optimization, and monitoring setup for Agent Flow.

## 🎯 Overview

### Deployment Options
- **Single Server** - All services on one machine
- **Multi-Server** - Distributed across multiple machines
- **Cloud Deployment** - AWS, GCP, Azure, or other cloud providers
- **Container Orchestration** - Kubernetes, Docker Swarm, or similar

### Production Requirements
- **High Availability** - 99.9% uptime target
- **Scalability** - Handle increased load
- **Security** - Secure data and communications
- **Monitoring** - Comprehensive observability
- **Backup** - Data protection and recovery

## 🏗 Architecture Options

### Single Server Deployment
```
┌─────────────────────────────────────────────────────────┐
│                    Production Server                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    N8N      │  │ PostgreSQL  │  │   Reverse   │    │
│  │   (App)     │  │ (Database)  │  │   Proxy     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Cursor    │  │  Monitoring │  │   Backup    │    │
│  │    CLI      │  │   (Logs)    │  │  (Storage)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Multi-Server Deployment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   App Server    │    │  Database Server│
│   (Nginx)       │───▶│   (N8N + CLI)   │───▶│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   File Storage  │    │   Backup Server │
│   (Prometheus)  │    │   (NFS/S3)      │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Cloud Deployment (AWS Example)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   ECS/EKS       │    │   RDS PostgreSQL│
│   (CDN)         │───▶│   (N8N + CLI)   │───▶│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudWatch    │    │   S3 Storage    │    │   S3 Backup     │
│   (Monitoring)  │    │   (Files)       │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Production Configuration

### Environment Variables

#### Required Variables
```bash
# N8N Configuration
N8N_PASSWORD=your_secure_production_password
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_production_password

# Database Configuration
DB_PASSWORD=your_secure_database_password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=n8n
DB_USER=n8n

# Cursor CLI Configuration
CURSOR_API_KEY=your_cursor_api_key
CURSOR_MODEL=claude-4-sonnet
CURSOR_TIMEOUT=300

# Production Settings
NODE_ENV=production
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=file
```

#### Optional Variables
```bash
# Security
N8N_ENCRYPTION_KEY=your_encryption_key
N8N_JWT_SECRET=your_jwt_secret

# Performance
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=true

# Monitoring
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_ENDPOINT=http://grafana:3000

# Backup
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Docker Compose Production

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:1.65.0
    ports:
      - "127.0.0.1:5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./src/workflow-definitions:/home/node/workflows:ro
      - ./src/n8n-nodes:/home/node/activities:ro
      - ./logs:/home/node/logs
    environment:
      - NODE_ENV=production
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=${DB_HOST}
      - DB_POSTGRESDB_PORT=${DB_PORT}
      - DB_POSTGRESDB_DATABASE=${DB_NAME}
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=file
      - N8N_METRICS=true
      - N8N_DIAGNOSTICS_ENABLED=true
    depends_on:
      - postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - n8n
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "127.0.0.1:9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
```

### Nginx Configuration

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://n8n;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # N8N UI
        location / {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://n8n;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
        }
    }
}
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Generate SSL Certificate
```bash
# Using Let's Encrypt
certbot certonly --standalone -d your-domain.com

# Using self-signed certificate (development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

#### SSL Configuration
```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

### Authentication and Authorization

#### Strong Passwords
```bash
# Generate secure passwords
openssl rand -base64 32

# Use password manager
# Store in secure environment variables
```

#### Multi-Factor Authentication
```yaml
# Add to docker-compose.prod.yml
environment:
  - N8N_MFA_ENABLED=true
  - N8N_MFA_TOTP_ISSUER=Agent Flow
```

### Network Security

#### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5678/tcp
sudo ufw deny 5432/tcp
sudo ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 5678 -j DROP
iptables -A INPUT -p tcp --dport 5432 -j DROP
```

#### VPN Access
```bash
# OpenVPN configuration
# Restrict access to N8N and database ports
# Use VPN for administrative access
```

## 📊 Monitoring and Observability

### Prometheus Configuration

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboards

#### Dashboard Configuration
```yaml
# grafana/provisioning/dashboards/dashboard.yml
apiVersion: 1

providers:
  - name: 'Agent Flow'
    orgId: 1
    folder: 'Agent Flow'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/provisioning/dashboards
```

#### Key Metrics to Monitor
- **System Metrics**: CPU, Memory, Disk, Network
- **Application Metrics**: Response time, Error rate, Throughput
- **Database Metrics**: Connection count, Query performance, Storage usage
- **Workflow Metrics**: Execution time, Success rate, Queue length

### Log Management

#### Centralized Logging
```yaml
# Add to docker-compose.prod.yml
  fluentd:
    image: fluent/fluentd:latest
    volumes:
      - ./fluentd.conf:/fluentd/etc/fluent.conf:ro
      - /var/log:/var/log:ro
    ports:
      - "24224:24224"
      - "24224:24224/udp"
```

#### Log Rotation
```bash
# /etc/logrotate.d/agent-flow
/var/log/agent-flow/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart n8n
    endscript
}
```

## 💾 Backup and Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="n8n_backup_${DATE}.sql"

# Create backup
docker-compose exec -T postgres pg_dump -U n8n n8n > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

#### Backup Schedule
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### File System Backup

#### N8N Data Backup
```bash
#!/bin/bash
# backup-n8n-data.sh

BACKUP_DIR="/backups/n8n-data"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker run --rm -v n8n_data:/data -v ${BACKUP_DIR}:/backup alpine \
  tar czf /backup/n8n_data_${DATE}.tar.gz -C /data .

# Upload to S3
aws s3 cp "${BACKUP_DIR}/n8n_data_${DATE}.tar.gz" s3://your-backup-bucket/

echo "N8N data backup completed: n8n_data_${DATE}.tar.gz"
```

### Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Download from S3
aws s3 cp s3://your-backup-bucket/${BACKUP_FILE} /tmp/

# Restore database
docker-compose exec -T postgres psql -U n8n -d n8n < /tmp/${BACKUP_FILE}

echo "Database restored from: ${BACKUP_FILE}"
```

#### Full System Recovery
```bash
#!/bin/bash
# restore-system.sh

# Stop services
docker-compose down

# Restore database
./restore-db.sh n8n_backup_20241007_020000.sql.gz

# Restore N8N data
docker run --rm -v n8n_data:/data -v /backups/n8n-data:/backup alpine \
  tar xzf /backup/n8n_data_20241007_020000.tar.gz -C /data

# Start services
docker-compose up -d

echo "System recovery completed"
```

## 🚀 Scaling and Performance

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream n8n {
    server n8n1:5678;
    server n8n2:5678;
    server n8n3:5678;
}
```

#### Database Scaling
```yaml
# PostgreSQL with read replicas
services:
  postgres-master:
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=master
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replicator_password

  postgres-slave:
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=slave
      - POSTGRES_MASTER_HOST=postgres-master
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replicator_password
```

### Vertical Scaling

#### Resource Limits
```yaml
# Increase resources
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2.0'
    reservations:
      memory: 2G
      cpus: '1.0'
```

#### Performance Tuning
```yaml
# PostgreSQL tuning
command: >
  postgres
  -c shared_buffers=512MB
  -c max_connections=200
  -c effective_cache_size=2GB
  -c maintenance_work_mem=64MB
  -c checkpoint_completion_target=0.9
  -c wal_buffers=16MB
  -c default_statistics_target=100
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/agent-flow
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml restart n8n
```

### Deployment Script

#### deploy.sh
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check health
if curl -f http://localhost/health; then
    echo "Deployment successful!"
else
    echo "Deployment failed!"
    exit 1
fi
```

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Cursor CLI Integration](05-cursor-cli.md)** - AI assistant configuration
- **[API Reference](06-api.md)** - Health and metrics endpoints
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07
