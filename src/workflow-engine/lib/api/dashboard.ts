/**
 * Monitoring dashboard and alerts
 */

import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';
import { HealthChecker } from './health';

export interface DashboardData {
  overview: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    version: string;
    lastUpdate: string;
  };
  services: {
    n8n: ServiceStatus;
    database: ServiceStatus;
    workflowEngine: ServiceStatus;
    cursorCli: ServiceStatus;
  };
  metrics: {
    workflows: {
      total: number;
      active: number;
      completed: number;
      failed: number;
    };
    performance: {
      averageResponseTime: number;
      throughput: number;
      errorRate: number;
    };
    system: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
    };
  };
  alerts: Alert[];
  recentActivity: Activity[];
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  component?: string;
  workflowId?: string;
  nodeId?: string;
}

export interface Activity {
  id: string;
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'node_executed' | 'error_occurred';
  message: string;
  timestamp: string;
  workflowId?: string;
  nodeId?: string;
  duration?: number;
  success?: boolean;
}

export class MonitoringDashboard {
  private static alerts: Alert[] = [];
  private static activities: Activity[] = [];
  private static maxAlerts = 100;
  private static maxActivities = 200;

  /**
   * Get dashboard data
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      const health = await HealthChecker.getHealthStatus();
      const metricsSummary = MetricsCollector.getSummary();

      // Get workflow metrics
      const workflowMetrics = this.getWorkflowMetrics();
      
      // Get performance metrics
      const performanceMetrics = this.getPerformanceMetrics();
      
      // Get system metrics
      const systemMetrics = this.getSystemMetrics();

      // Get recent alerts and activities
      const recentAlerts = this.getRecentAlerts(10);
      const recentActivities = this.getRecentActivities(20);

      const dashboardData: DashboardData = {
        overview: {
          status: health.status,
          uptime: health.uptime,
          version: health.version,
          lastUpdate: new Date().toISOString(),
        },
        services: {
          n8n: this.mapServiceStatus('N8N', health.services.n8n),
          database: this.mapServiceStatus('Database', health.services.database),
          workflowEngine: this.mapServiceStatus('Workflow Engine', health.services.workflowEngine),
          cursorCli: this.mapServiceStatus('Cursor CLI', health.services.cursorCli),
        },
        metrics: {
          workflows: workflowMetrics,
          performance: performanceMetrics,
          system: systemMetrics,
        },
        alerts: recentAlerts,
        recentActivity: recentActivities,
      };

      Logger.debug('Dashboard data generated', {
        operation: 'getDashboardData',
        status: health.status,
        alertsCount: recentAlerts.length,
        activitiesCount: recentActivities.length,
      });

      return dashboardData;

    } catch (error) {
      Logger.error('Failed to get dashboard data', error as Error, {
        operation: 'getDashboardData',
      });

      throw error;
    }
  }

  /**
   * Add an alert
   */
  static addAlert(alert: Omit<Alert, 'id' | 'timestamp'>): void {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.alerts.unshift(newAlert);

    // Keep only the most recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    Logger.warn(`Alert created: ${alert.message}`, {
      operation: 'addAlert',
      alertId: newAlert.id,
      type: alert.type,
      severity: alert.severity,
    });
  }

  /**
   * Add an activity
   */
  static addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
    const newActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.activities.unshift(newActivity);

    // Keep only the most recent activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }

    Logger.debug(`Activity recorded: ${activity.message}`, {
      operation: 'addActivity',
      activityId: newActivity.id,
      type: activity.type,
      workflowId: activity.workflowId,
    });
  }

  /**
   * Resolve an alert
   */
  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      Logger.info(`Alert resolved: ${alertId}`, {
        operation: 'resolveAlert',
        alertId,
      });
      return true;
    }
    return false;
  }

  /**
   * Get recent alerts
   */
  static getRecentAlerts(limit: number = 10): Alert[] {
    return this.alerts
      .filter(alert => !alert.resolved)
      .slice(0, limit);
  }

  /**
   * Get recent activities
   */
  static getRecentActivities(limit: number = 20): Activity[] {
    return this.activities.slice(0, limit);
  }

  /**
   * Get workflow metrics
   */
  private static getWorkflowMetrics(): {
    total: number;
    active: number;
    completed: number;
    failed: number;
  } {
    // This would typically query the workflow registry
    // For now, return mock data
    return {
      total: 5, // Total workflows defined
      active: 0, // Currently running workflows
      completed: 0, // Completed workflows
      failed: 0, // Failed workflows
    };
  }

  /**
   * Get performance metrics
   */
  private static getPerformanceMetrics(): {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
  } {
    const metricsSummary = MetricsCollector.getSummary();
    
    return {
      averageResponseTime: metricsSummary.averageWorkflowDuration,
      throughput: 0, // Workflows per minute
      errorRate: metricsSummary.recentErrors,
    };
  }

  /**
   * Get system metrics
   */
  private static getSystemMetrics(): {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  } {
    // This would typically get real system metrics
    // For now, return mock data
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
    };
  }

  /**
   * Map service health to service status
   */
  private static mapServiceStatus(name: string, health: any): ServiceStatus {
    return {
      name,
      status: health.status,
      uptime: 0, // Would be calculated from service start time
      lastCheck: health.lastCheck,
      responseTime: health.responseTime,
      error: health.error,
    };
  }

  /**
   * Create common alerts
   */
  static createCommonAlerts(): void {
    // High error rate alert
    const metricsSummary = MetricsCollector.getSummary();
    if (metricsSummary.recentErrors > 10) {
      this.addAlert({
        type: 'error',
        severity: 'high',
        message: `High error rate detected: ${metricsSummary.recentErrors} errors in the last hour`,
        resolved: false,
        component: 'System',
      });
    }

    // High response time alert
    if (metricsSummary.averageWorkflowDuration > 30000) {
      this.addAlert({
        type: 'warning',
        severity: 'medium',
        message: `High response time detected: ${metricsSummary.averageWorkflowDuration}ms average`,
        resolved: false,
        component: 'Performance',
      });
    }

    // System health alert
    if (metricsSummary.systemHealth === 'critical') {
      this.addAlert({
        type: 'error',
        severity: 'critical',
        message: 'System health is critical',
        resolved: false,
        component: 'System',
      });
    }
  }

  /**
   * Clear old data
   */
  static clearOldData(): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Clear old alerts
    const initialAlertCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > oneWeekAgo
    );

    // Clear old activities
    const initialActivityCount = this.activities.length;
    this.activities = this.activities.filter(activity => 
      new Date(activity.timestamp) > oneWeekAgo
    );

    Logger.info('Cleared old dashboard data', {
      operation: 'clearOldData',
      alertsRemoved: initialAlertCount - this.alerts.length,
      activitiesRemoved: initialActivityCount - this.activities.length,
    });
  }
}

/**
 * Express.js dashboard endpoints
 */
export function createDashboardEndpoints(app: any): void {
  // Dashboard data endpoint
  app.get('/dashboard', async (req: any, res: any) => {
    try {
      const dashboardData = await MonitoringDashboard.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Alerts endpoint
  app.get('/alerts', (req: any, res: any) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const alerts = MonitoringDashboard.getRecentAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Activities endpoint
  app.get('/activities', (req: any, res: any) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const activities = MonitoringDashboard.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Resolve alert endpoint
  app.post('/alerts/:alertId/resolve', (req: any, res: any) => {
    try {
      const { alertId } = req.params;
      const resolved = MonitoringDashboard.resolveAlert(alertId);
      
      if (resolved) {
        res.json({ success: true, message: 'Alert resolved' });
      } else {
        res.status(404).json({ success: false, message: 'Alert not found' });
      }
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}
