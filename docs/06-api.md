# API Reference

> **Complete API documentation for Agent Flow's health checks, metrics, and monitoring endpoints**

Agent Flow provides RESTful APIs for monitoring system health, collecting performance metrics, and managing workflows. These APIs are designed for both human consumption and integration with monitoring systems.

## 🎯 Overview

### Base URL
```
http://localhost:5678
```

### Authentication
All API endpoints require basic authentication:
- **Username**: `admin` (or value from `N8N_BASIC_AUTH_USER`)
- **Password**: Value from `N8N_BASIC_AUTH_PASSWORD` environment variable

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`

### Error Handling
All endpoints return appropriate HTTP status codes and error messages in JSON format.

## 🔍 Health Check Endpoints

### GET /health

Check the overall system health status.

#### Request
```http
GET /health HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
Content-Type: application/json
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-10-07T20:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "n8n": {
      "status": "healthy",
      "responseTime": 45,
      "lastChecked": "2024-10-07T20:30:00.000Z"
    },
    "postgres": {
      "status": "healthy",
      "responseTime": 12,
      "lastChecked": "2024-10-07T20:30:00.000Z"
    },
    "cursor-cli": {
      "status": "healthy",
      "version": "1.0.0",
      "lastChecked": "2024-10-07T20:30:00.000Z"
    }
  },
  "workflows": {
    "total": 5,
    "active": 5,
    "lastExecution": "2024-10-07T20:25:00.000Z"
  }
}
```

#### Status Codes
- `200 OK` - System is healthy
- `503 Service Unavailable` - One or more services are unhealthy

### GET /health/n8n

Check N8N service health specifically.

#### Request
```http
GET /health/n8n HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "status": "healthy",
  "responseTime": 45,
  "version": "1.65.0",
  "uptime": 3600,
  "memoryUsage": {
    "used": "256MB",
    "total": "512MB",
    "percentage": 50
  },
  "lastChecked": "2024-10-07T20:30:00.000Z"
}
```

### GET /health/postgres

Check PostgreSQL database health.

#### Request
```http
GET /health/postgres HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "status": "healthy",
  "responseTime": 12,
  "version": "15-alpine",
  "connections": {
    "active": 5,
    "max": 100,
    "percentage": 5
  },
  "database": {
    "name": "n8n",
    "size": "25MB",
    "tables": 12
  },
  "lastChecked": "2024-10-07T20:30:00.000Z"
}
```

### GET /health/cursor-cli

Check Cursor CLI availability and configuration.

#### Request
```http
GET /health/cursor-cli HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "model": "claude-4-sonnet",
  "timeout": 300,
  "lastChecked": "2024-10-07T20:30:00.000Z"
}
```

## 📊 Metrics Endpoints

### GET /metrics

Get comprehensive system metrics and performance data.

#### Request
```http
GET /metrics HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "timestamp": "2024-10-07T20:30:00.000Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "used": "1.2GB",
      "total": "4GB",
      "percentage": 30
    },
    "cpu": {
      "usage": 25.5,
      "cores": 4
    },
    "disk": {
      "used": "15GB",
      "total": "100GB",
      "percentage": 15
    }
  },
  "services": {
    "n8n": {
      "uptime": 3600,
      "memoryUsage": "256MB",
      "cpuUsage": 15.2,
      "requests": {
        "total": 1250,
        "successful": 1200,
        "failed": 50,
        "successRate": 96.0
      }
    },
    "postgres": {
      "uptime": 3600,
      "memoryUsage": "128MB",
      "cpuUsage": 8.5,
      "queries": {
        "total": 5000,
        "slow": 25,
        "averageTime": 12.5
      }
    }
  },
  "workflows": {
    "executions": {
      "total": 150,
      "successful": 145,
      "failed": 5,
      "successRate": 96.7
    },
    "performance": {
      "averageExecutionTime": 45.2,
      "fastestExecution": 12.1,
      "slowestExecution": 180.5
    }
  },
  "cursor-cli": {
    "requests": {
      "total": 75,
      "successful": 72,
      "failed": 3,
      "successRate": 96.0
    },
    "performance": {
      "averageResponseTime": 15.8,
      "fastestResponse": 5.2,
      "slowestResponse": 45.6
    },
    "models": {
      "claude-4-sonnet": 50,
      "claude-4-opus": 15,
      "gpt-4": 10
    }
  }
}
```

### GET /metrics/workflows

Get detailed workflow execution metrics.

#### Request
```http
GET /metrics/workflows HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "timestamp": "2024-10-07T20:30:00.000Z",
  "workflows": [
    {
      "id": "code-review-workflow",
      "name": "AI Code Review",
      "executions": {
        "total": 50,
        "successful": 48,
        "failed": 2,
        "successRate": 96.0
      },
      "performance": {
        "averageExecutionTime": 45.2,
        "fastestExecution": 12.1,
        "slowestExecution": 180.5,
        "totalExecutionTime": 2260
      },
      "lastExecution": "2024-10-07T20:25:00.000Z",
      "status": "active"
    },
    {
      "id": "refactoring-workflow",
      "name": "AI Refactoring",
      "executions": {
        "total": 30,
        "successful": 29,
        "failed": 1,
        "successRate": 96.7
      },
      "performance": {
        "averageExecutionTime": 78.5,
        "fastestExecution": 25.3,
        "slowestExecution": 200.1,
        "totalExecutionTime": 2355
      },
      "lastExecution": "2024-10-07T20:20:00.000Z",
      "status": "active"
    }
  ],
  "summary": {
    "totalWorkflows": 5,
    "activeWorkflows": 5,
    "totalExecutions": 150,
    "successfulExecutions": 145,
    "failedExecutions": 5,
    "overallSuccessRate": 96.7
  }
}
```

### GET /metrics/cursor-cli

Get Cursor CLI usage and performance metrics.

#### Request
```http
GET /metrics/cursor-cli HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "timestamp": "2024-10-07T20:30:00.000Z",
  "usage": {
    "totalRequests": 75,
    "successfulRequests": 72,
    "failedRequests": 3,
    "successRate": 96.0
  },
  "performance": {
    "averageResponseTime": 15.8,
    "fastestResponse": 5.2,
    "slowestResponse": 45.6,
    "totalResponseTime": 1185
  },
  "models": {
    "claude-4-sonnet": {
      "requests": 50,
      "averageResponseTime": 12.5,
      "successRate": 98.0
    },
    "claude-4-opus": {
      "requests": 15,
      "averageResponseTime": 25.3,
      "successRate": 93.3
    },
    "gpt-4": {
      "requests": 10,
      "averageResponseTime": 18.7,
      "successRate": 90.0
    }
  },
  "errors": {
    "timeout": 2,
    "authentication": 1,
    "rateLimit": 0,
    "other": 0
  }
}
```

## 🎛 Dashboard Endpoints

### GET /dashboard

Get a comprehensive dashboard view of the system.

#### Request
```http
GET /dashboard HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "timestamp": "2024-10-07T20:30:00.000Z",
  "overview": {
    "status": "healthy",
    "uptime": 3600,
    "version": "1.0.0"
  },
  "services": {
    "n8n": {
      "status": "healthy",
      "uptime": 3600,
      "memoryUsage": "256MB",
      "cpuUsage": 15.2
    },
    "postgres": {
      "status": "healthy",
      "uptime": 3600,
      "memoryUsage": "128MB",
      "cpuUsage": 8.5
    },
    "cursor-cli": {
      "status": "healthy",
      "version": "1.0.0",
      "model": "claude-4-sonnet"
    }
  },
  "workflows": {
    "total": 5,
    "active": 5,
    "executions": {
      "total": 150,
      "successful": 145,
      "failed": 5,
      "successRate": 96.7
    }
  },
  "alerts": [
    {
      "id": "high-cpu-usage",
      "type": "warning",
      "message": "CPU usage is above 80%",
      "timestamp": "2024-10-07T20:25:00.000Z"
    }
  ]
}
```

### GET /dashboard/workflows

Get workflow-specific dashboard data.

#### Request
```http
GET /dashboard/workflows HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "timestamp": "2024-10-07T20:30:00.000Z",
  "workflows": [
    {
      "id": "code-review-workflow",
      "name": "AI Code Review",
      "status": "active",
      "executions": {
        "total": 50,
        "successful": 48,
        "failed": 2,
        "successRate": 96.0
      },
      "performance": {
        "averageExecutionTime": 45.2,
        "lastExecution": "2024-10-07T20:25:00.000Z"
      },
      "health": "healthy"
    }
  ],
  "summary": {
    "totalWorkflows": 5,
    "activeWorkflows": 5,
    "overallSuccessRate": 96.7
  }
}
```

## 🔧 Management Endpoints

### POST /workflows/execute

Execute a specific workflow.

#### Request
```http
POST /workflows/execute HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
Content-Type: application/json

{
  "workflowId": "code-review-workflow",
  "input": {
    "prompt": "Review this code for security issues",
    "projectPath": "/path/to/project",
    "model": "claude-4-sonnet"
  }
}
```

#### Response
```json
{
  "success": true,
  "executionId": "exec_123456789",
  "workflowId": "code-review-workflow",
  "status": "running",
  "startedAt": "2024-10-07T20:30:00.000Z",
  "estimatedDuration": 60
}
```

### GET /workflows/{executionId}/status

Get the status of a workflow execution.

#### Request
```http
GET /workflows/exec_123456789/status HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "executionId": "exec_123456789",
  "workflowId": "code-review-workflow",
  "status": "completed",
  "startedAt": "2024-10-07T20:30:00.000Z",
  "completedAt": "2024-10-07T20:31:00.000Z",
  "duration": 60,
  "result": {
    "success": true,
    "output": "Code review completed successfully",
    "data": {
      "summary": "No security issues found",
      "recommendations": ["Consider adding input validation"]
    }
  }
}
```

### GET /workflows

List all available workflows.

#### Request
```http
GET /workflows HTTP/1.1
Host: localhost:5678
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

#### Response
```json
{
  "workflows": [
    {
      "id": "code-review-workflow",
      "name": "AI Code Review",
      "description": "Automated code review using Cursor CLI",
      "version": "1.0.0",
      "status": "active",
      "tags": ["ai", "review", "development"]
    },
    {
      "id": "refactoring-workflow",
      "name": "AI Refactoring",
      "description": "Batch code modernization and optimization",
      "version": "1.0.0",
      "status": "active",
      "tags": ["ai", "refactoring", "development"]
    }
  ],
  "total": 5
}
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "WORKFLOW_NOT_FOUND",
    "message": "Workflow with ID 'invalid-workflow' not found",
    "details": {
      "workflowId": "invalid-workflow",
      "availableWorkflows": ["code-review-workflow", "refactoring-workflow"]
    },
    "timestamp": "2024-10-07T20:30:00.000Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `WORKFLOW_NOT_FOUND` | 404 | Workflow not found |
| `EXECUTION_NOT_FOUND` | 404 | Execution not found |
| `INVALID_INPUT` | 400 | Invalid request data |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Internal server error |

## 📊 Rate Limiting

### Rate Limits
- **Health endpoints**: 100 requests per minute
- **Metrics endpoints**: 60 requests per minute
- **Workflow execution**: 10 requests per minute
- **Dashboard endpoints**: 30 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

## 🔐 Security

### Authentication
All endpoints require basic authentication using the credentials configured in the environment variables.

### HTTPS
In production, all API endpoints should be accessed over HTTPS to ensure data security.

### CORS
CORS is configured to allow requests from the same origin. For cross-origin requests, appropriate CORS headers should be configured.

### Input Validation
All input data is validated and sanitized to prevent injection attacks and ensure data integrity.

## 📚 Examples

### Health Check Script
```bash
#!/bin/bash
# Check system health
curl -u admin:password http://localhost:5678/health | jq '.status'
```

### Metrics Collection
```bash
#!/bin/bash
# Collect metrics
curl -u admin:password http://localhost:5678/metrics | jq '.system.memory.percentage'
```

### Workflow Execution
```bash
#!/bin/bash
# Execute workflow
curl -u admin:password -X POST http://localhost:5678/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "code-review-workflow",
    "input": {
      "prompt": "Review this code",
      "projectPath": "/path/to/project"
    }
  }'
```

### Monitoring Integration
```bash
#!/bin/bash
# Send metrics to monitoring system
curl -u admin:password http://localhost:5678/metrics | \
  jq '.system.memory.percentage' | \
  curl -X POST -d @- http://monitoring-system.com/metrics
```

## 📚 Additional Resources

- **[Taskfile Commands](01-taskfile.md)** - CLI automation
- **[Docker Setup](02-docker-compose.md)** - Infrastructure configuration
- **[Custom Activities](03-custom-activities.md)** - N8N node development
- **[Workflow Development](04-workflow-code.md)** - TypeScript workflow definitions
- **[Cursor CLI Integration](05-cursor-cli.md)** - AI assistant configuration
- **[Troubleshooting](08-troubleshooting.md)** - Common issues and solutions

---

**Version:** 1.0.0 | **Last Updated:** 2024-10-07
