/**
 * Performance metrics collection and monitoring
 */

import { Logger } from './logger';

export interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
}

export class MetricsCollector {
  private static metrics: MetricData[] = [];
  private static maxMetrics = 1000;
  private static collectionInterval: NodeJS.Timeout | null = null;

  /**
   * Record a metric
   */
  static record(metric: Omit<MetricData, 'timestamp'>): void {
    const metricData: MetricData = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(metricData);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log the metric
    Logger.debug(`Metric recorded: ${metric.name}`, {
      metric: metric.name,
      value: metric.value,
      unit: metric.unit,
      tags: metric.tags,
    });
  }

  /**
   * Record workflow execution metrics
   */
  static recordWorkflowExecution(
    workflowId: string,
    duration: number,
    success: boolean,
    nodeCount: number
  ): void {
    this.record({
      name: 'workflow.execution.duration',
      value: duration,
      unit: 'ms',
      tags: {
        workflowId,
        success: success.toString(),
        nodeCount: nodeCount.toString(),
      },
    });

    this.record({
      name: 'workflow.execution.count',
      value: 1,
      unit: 'count',
      tags: {
        workflowId,
        success: success.toString(),
      },
    });
  }

  /**
   * Record node execution metrics
   */
  static recordNodeExecution(
    nodeId: string,
    workflowId: string,
    duration: number,
    success: boolean,
    nodeType: string
  ): void {
    this.record({
      name: 'node.execution.duration',
      value: duration,
      unit: 'ms',
      tags: {
        nodeId,
        workflowId,
        nodeType,
        success: success.toString(),
      },
    });

    this.record({
      name: 'node.execution.count',
      value: 1,
      unit: 'count',
      tags: {
        nodeId,
        workflowId,
        nodeType,
        success: success.toString(),
      },
    });
  }

  /**
   * Record system resource metrics
   */
  static recordSystemMetrics(metrics: SystemMetrics): void {
    // CPU metrics
    this.record({
      name: 'system.cpu.usage',
      value: metrics.cpu.usage,
      unit: 'percent',
      tags: {},
    });

    this.record({
      name: 'system.cpu.load_average',
      value: metrics.cpu.loadAverage[0],
      unit: 'load',
      tags: { period: '1m' },
    });

    // Memory metrics
    this.record({
      name: 'system.memory.usage',
      value: metrics.memory.usage,
      unit: 'percent',
      tags: {},
    });

    this.record({
      name: 'system.memory.used',
      value: metrics.memory.used,
      unit: 'bytes',
      tags: {},
    });

    this.record({
      name: 'system.memory.free',
      value: metrics.memory.free,
      unit: 'bytes',
      tags: {},
    });

    // Disk metrics
    this.record({
      name: 'system.disk.usage',
      value: metrics.disk.usage,
      unit: 'percent',
      tags: {},
    });

    this.record({
      name: 'system.disk.used',
      value: metrics.disk.used,
      unit: 'bytes',
      tags: {},
    });

    this.record({
      name: 'system.disk.free',
      value: metrics.disk.free,
      unit: 'bytes',
      tags: {},
    });

    // Network metrics
    this.record({
      name: 'system.network.bytes_in',
      value: metrics.network.bytesIn,
      unit: 'bytes',
      tags: {},
    });

    this.record({
      name: 'system.network.bytes_out',
      value: metrics.network.bytesOut,
      unit: 'bytes',
      tags: {},
    });

    this.record({
      name: 'system.network.connections',
      value: metrics.network.connections,
      unit: 'count',
      tags: {},
    });
  }

  /**
   * Record error metrics
   */
  static recordError(
    errorType: string,
    component: string,
    workflowId?: string,
    nodeId?: string
  ): void {
    this.record({
      name: 'error.count',
      value: 1,
      unit: 'count',
      tags: {
        errorType,
        component,
        workflowId: workflowId || 'unknown',
        nodeId: nodeId || 'unknown',
      },
    });
  }

  /**
   * Get metrics by name
   */
  static getMetrics(name: string, timeRange?: { start: Date; end: Date }): MetricData[] {
    let filtered = this.metrics.filter(m => m.name === name);

    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  /**
   * Get aggregated metrics
   */
  static getAggregatedMetrics(
    name: string,
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count',
    timeRange?: { start: Date; end: Date }
  ): number {
    const metrics = this.getMetrics(name, timeRange);
    
    if (metrics.length === 0) return 0;

    const values = metrics.map(m => m.value);

    switch (aggregation) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): MetricData[] {
    return [...this.metrics];
  }

  /**
   * Clear old metrics
   */
  static clearOldMetrics(olderThanHours: number = 24): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    
    const removedCount = initialCount - this.metrics.length;
    
    Logger.info(`Cleared ${removedCount} old metrics`, {
      operation: 'clearOldMetrics',
      olderThanHours,
      remainingCount: this.metrics.length,
    });
  }

  /**
   * Start automatic system metrics collection
   */
  static startSystemMetricsCollection(intervalMs: number = 60000): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.collectionInterval = setInterval(async () => {
      try {
        const systemMetrics = await this.collectSystemMetrics();
        this.recordSystemMetrics(systemMetrics);
      } catch (error) {
        Logger.error('Failed to collect system metrics', error as Error);
      }
    }, intervalMs);

    Logger.info('Started system metrics collection', {
      operation: 'startSystemMetricsCollection',
      intervalMs,
    });
  }

  /**
   * Stop automatic system metrics collection
   */
  static stopSystemMetricsCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    Logger.info('Stopped system metrics collection', {
      operation: 'stopSystemMetricsCollection',
    });
  }

  /**
   * Collect current system metrics
   */
  private static async collectSystemMetrics(): Promise<SystemMetrics> {
    const os = await import('os');
    
    // CPU metrics
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    
    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // Disk metrics (simplified - would need more sophisticated disk monitoring)
    const diskUsage = await this.getDiskUsage();

    return {
      cpu: {
        usage: cpuUsagePercent,
        loadAverage: os.loadavg(),
      },
      memory: {
        used: usedMem,
        free: freeMem,
        total: totalMem,
        usage: memUsagePercent,
      },
      disk: {
        used: diskUsage.used,
        free: diskUsage.free,
        total: diskUsage.total,
        usage: diskUsage.usage,
      },
      network: {
        bytesIn: 0, // Would need network monitoring
        bytesOut: 0,
        connections: 0,
      },
    };
  }

  /**
   * Get disk usage (simplified implementation)
   */
  private static async getDiskUsage(): Promise<{
    used: number;
    free: number;
    total: number;
    usage: number;
  }> {
    try {
      const fs = await import('fs');
      const stats = fs.statSync('.');
      
      // This is a simplified implementation
      // In production, you'd use a proper disk usage library
      return {
        used: 0,
        free: 0,
        total: 0,
        usage: 0,
      };
    } catch (error) {
      Logger.warn('Failed to get disk usage', { error: (error as Error).message });
      return {
        used: 0,
        free: 0,
        total: 0,
        usage: 0,
      };
    }
  }

  /**
   * Get metrics summary
   */
  static getSummary(): {
    totalMetrics: number;
    metricsByType: Record<string, number>;
    recentErrors: number;
    averageWorkflowDuration: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    const errorMetrics = recentMetrics.filter(m => m.name === 'error.count');
    const workflowMetrics = recentMetrics.filter(m => m.name === 'workflow.execution.duration');

    const metricsByType: Record<string, number> = {};
    recentMetrics.forEach(m => {
      metricsByType[m.name] = (metricsByType[m.name] || 0) + 1;
    });

    const recentErrors = this.getAggregatedMetrics('error.count', 'sum', {
      start: oneHourAgo,
      end: now,
    });

    const averageWorkflowDuration = this.getAggregatedMetrics(
      'workflow.execution.duration',
      'avg',
      { start: oneHourAgo, end: now }
    );

    // Determine system health based on error rate and performance
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (recentErrors > 10) {
      systemHealth = 'critical';
    } else if (recentErrors > 5 || averageWorkflowDuration > 30000) {
      systemHealth = 'warning';
    }

    return {
      totalMetrics: this.metrics.length,
      metricsByType,
      recentErrors,
      averageWorkflowDuration,
      systemHealth,
    };
  }
}
