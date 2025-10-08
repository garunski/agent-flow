/**
 * Health check endpoints and monitoring
 */

import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';
import { validateSystem } from '../utils/validation';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    n8n: ServiceHealth;
    database: ServiceHealth;
    workflowEngine: ServiceHealth;
    cursorCli: ServiceHealth;
  };
  metrics: {
    totalWorkflows: number;
    activeWorkflows: number;
    recentErrors: number;
    averageResponseTime: number;
  };
  system: {
    memory: {
      used: number;
      free: number;
      usage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: Record<string, unknown>;
}

export class HealthChecker {
  private static startTime = Date.now();
  private static lastHealthCheck = new Date();

  /**
   * Get overall system health
   */
  static async getHealthStatus(): Promise<HealthStatus> {
    const now = new Date();
    this.lastHealthCheck = now;

    try {
      // Check all services in parallel
      const [
        n8nHealth,
        databaseHealth,
        workflowEngineHealth,
        cursorCliHealth,
        systemMetrics,
        validationResult
      ] = await Promise.all([
        this.checkN8NHealth(),
        this.checkDatabaseHealth(),
        this.checkWorkflowEngineHealth(),
        this.checkCursorCliHealth(),
        this.getSystemMetrics(),
        validateSystem()
      ]);

      // Calculate overall status
      const serviceStatuses = [
        n8nHealth.status,
        databaseHealth.status,
        workflowEngineHealth.status,
        cursorCliHealth.status,
      ];

      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (serviceStatuses.includes('unhealthy')) {
        overallStatus = 'unhealthy';
      } else if (serviceStatuses.includes('degraded')) {
        overallStatus = 'degraded';
      }

      // Get metrics summary
      const metricsSummary = MetricsCollector.getSummary();

      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: now.toISOString(),
        version: '1.0.0',
        uptime: Date.now() - this.startTime,
        services: {
          n8n: n8nHealth,
          database: databaseHealth,
          workflowEngine: workflowEngineHealth,
          cursorCli: cursorCliHealth,
        },
        metrics: {
          totalWorkflows: 0, // Would be populated from workflow registry
          activeWorkflows: 0,
          recentErrors: metricsSummary.recentErrors,
          averageResponseTime: metricsSummary.averageWorkflowDuration,
        },
        system: {
          memory: {
            used: systemMetrics.memory.used,
            free: systemMetrics.memory.free,
            usage: systemMetrics.memory.usage,
          },
          cpu: {
            usage: systemMetrics.cpu.usage,
            loadAverage: systemMetrics.cpu.loadAverage,
          },
        },
      };

      // Log health check
      Logger.info('Health check completed', {
        operation: 'healthCheck',
        status: overallStatus,
        servicesHealthy: serviceStatuses.filter(s => s === 'healthy').length,
        servicesTotal: serviceStatuses.length,
      });

      return healthStatus;

    } catch (error) {
      Logger.error('Health check failed', error as Error, {
        operation: 'healthCheck',
      });

      return {
        status: 'unhealthy',
        timestamp: now.toISOString(),
        version: '1.0.0',
        uptime: Date.now() - this.startTime,
        services: {
          n8n: { status: 'unhealthy', lastCheck: now.toISOString(), error: 'Health check failed' },
          database: { status: 'unhealthy', lastCheck: now.toISOString(), error: 'Health check failed' },
          workflowEngine: { status: 'unhealthy', lastCheck: now.toISOString(), error: 'Health check failed' },
          cursorCli: { status: 'unhealthy', lastCheck: now.toISOString(), error: 'Health check failed' },
        },
        metrics: {
          totalWorkflows: 0,
          activeWorkflows: 0,
          recentErrors: 0,
          averageResponseTime: 0,
        },
        system: {
          memory: { used: 0, free: 0, usage: 0 },
          cpu: { usage: 0, loadAverage: [0, 0, 0] },
        },
      };
    }
  }

  /**
   * Check N8N service health
   */
  private static async checkN8NHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const now = new Date();

    try {
      const response = await fetch('http://localhost:5678/healthz', {
        method: 'GET',
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: now.toISOString(),
        details: {
          statusCode: response.status,
          responseTime,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: now.toISOString(),
        error: (error as Error).message,
        details: {
          error: (error as Error).message,
        },
      };
    }
  }

  /**
   * Check database health
   */
  private static async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const now = new Date();

    try {
      // This would typically use a database connection
      // For now, we'll simulate a database check
      const { execSync } = await import('child_process');
      
      execSync('docker-compose exec postgres pg_isready -U n8n', {
        stdio: 'pipe',
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: now.toISOString(),
        details: {
          responseTime,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: now.toISOString(),
        error: (error as Error).message,
        details: {
          error: (error as Error).message,
        },
      };
    }
  }

  /**
   * Check workflow engine health
   */
  private static async checkWorkflowEngineHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const now = new Date();

    try {
      // Check if workflow engine is responsive
      const metricsSummary = MetricsCollector.getSummary();
      const responseTime = Date.now() - startTime;

      const isHealthy = metricsSummary.systemHealth === 'healthy';

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: now.toISOString(),
        details: {
          systemHealth: metricsSummary.systemHealth,
          totalMetrics: metricsSummary.totalMetrics,
          recentErrors: metricsSummary.recentErrors,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: now.toISOString(),
        error: (error as Error).message,
        details: {
          error: (error as Error).message,
        },
      };
    }
  }

  /**
   * Check Cursor CLI health
   */
  private static async checkCursorCliHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const now = new Date();

    try {
      const { execSync } = await import('child_process');
      
      execSync('cursor-agent --version', {
        stdio: 'pipe',
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: now.toISOString(),
        details: {
          responseTime,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: now.toISOString(),
        error: (error as Error).message,
        details: {
          error: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get system metrics
   */
  private static async getSystemMetrics(): Promise<{
    memory: { used: number; free: number; usage: number };
    cpu: { usage: number; loadAverage: number[] };
  }> {
    try {
      const os = await import('os');
      
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = (usedMem / totalMem) * 100;

      const cpuUsage = process.cpuUsage();
      const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000;

      return {
        memory: {
          used: usedMem,
          free: freeMem,
          usage: memUsagePercent,
        },
        cpu: {
          usage: cpuUsagePercent,
          loadAverage: os.loadavg(),
        },
      };

    } catch (error) {
      Logger.error('Failed to get system metrics', error as Error);
      
      return {
        memory: { used: 0, free: 0, usage: 0 },
        cpu: { usage: 0, loadAverage: [0, 0, 0] },
      };
    }
  }

  /**
   * Get readiness status
   */
  static async getReadinessStatus(): Promise<{
    ready: boolean;
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const health = await this.getHealthStatus();
    
    const checks = {
      n8n: health.services.n8n.status === 'healthy',
      database: health.services.database.status === 'healthy',
      workflowEngine: health.services.workflowEngine.status === 'healthy',
      cursorCli: health.services.cursorCli.status === 'healthy',
    };

    const ready = Object.values(checks).every(check => check);

    return {
      ready,
      checks,
      timestamp: health.timestamp,
    };
  }

  /**
   * Get liveness status
   */
  static getLivenessStatus(): {
    alive: boolean;
    uptime: number;
    timestamp: string;
  } {
    return {
      alive: true,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Express.js health check endpoints
 */
export function createHealthEndpoints(app: any): void {
  // Health check endpoint
  app.get('/health', async (req: any, res: any) => {
    try {
      const health = await HealthChecker.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Readiness endpoint
  app.get('/ready', async (req: any, res: any) => {
    try {
      const readiness = await HealthChecker.getReadinessStatus();
      const statusCode = readiness.ready ? 200 : 503;
      
      res.status(statusCode).json(readiness);
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness endpoint
  app.get('/live', (req: any, res: any) => {
    const liveness = HealthChecker.getLivenessStatus();
    res.json(liveness);
  });

  // Metrics endpoint
  app.get('/metrics', (req: any, res: any) => {
    try {
      const summary = MetricsCollector.getSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}
