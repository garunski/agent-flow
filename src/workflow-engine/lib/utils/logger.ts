/**
 * Structured logging with winston
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

export interface LogContext {
  workflowId?: string;
  nodeId?: string;
  userId?: string;
  operation?: string;
  component?: string;
  duration?: number;
  [key: string]: unknown;
}

export class Logger {
  private static instance: winston.Logger;
  private static logDir = './logs';

  /**
   * Get or create logger instance
   */
  static getInstance(): winston.Logger {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  /**
   * Initialize logger with configuration
   */
  private static initialize(): void {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Create custom format
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        });
      })
    );

    // Create logger instance
    this.instance = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: 'agent-flow',
        version: '1.0.0',
      },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const context = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} [${level}]: ${message}${context}`;
            })
          ),
        }),

        // File transport for errors
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // File transport for all logs
        new winston.transports.File({
          filename: path.join(this.logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),

        // File transport for workflow logs
        new winston.transports.File({
          filename: path.join(this.logDir, 'workflows.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });

    // Handle uncaught exceptions
    this.instance.exceptions.handle(
      new winston.transports.File({
        filename: path.join(this.logDir, 'exceptions.log'),
      })
    );

    // Handle unhandled rejections
    this.instance.rejections.handle(
      new winston.transports.File({
        filename: path.join(this.logDir, 'rejections.log'),
      })
    );
  }

  /**
   * Log info message
   */
  static info(message: string, context?: LogContext): void {
    this.getInstance().info(message, context);
  }

  /**
   * Log error message
   */
  static error(message: string, error?: Error, context?: LogContext): void {
    this.getInstance().error(message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  /**
   * Log warning message
   */
  static warn(message: string, context?: LogContext): void {
    this.getInstance().warn(message, context);
  }

  /**
   * Log debug message
   */
  static debug(message: string, context?: LogContext): void {
    this.getInstance().debug(message, context);
  }

  /**
   * Log workflow operation
   */
  static workflow(operation: string, workflowId: string, context?: LogContext): void {
    this.getInstance().info(`Workflow ${operation}`, {
      ...context,
      workflowId,
      operation,
      component: 'WorkflowEngine',
    });
  }

  /**
   * Log node operation
   */
  static node(operation: string, nodeId: string, workflowId?: string, context?: LogContext): void {
    this.getInstance().info(`Node ${operation}`, {
      ...context,
      nodeId,
      workflowId,
      operation,
      component: 'WorkflowNode',
    });
  }

  /**
   * Log performance metrics
   */
  static performance(operation: string, duration: number, context?: LogContext): void {
    this.getInstance().info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      component: 'Performance',
    });
  }

  /**
   * Log system event
   */
  static system(event: string, context?: LogContext): void {
    this.getInstance().info(`System: ${event}`, {
      ...context,
      event,
      component: 'System',
    });
  }

  /**
   * Log security event
   */
  static security(event: string, context?: LogContext): void {
    this.getInstance().warn(`Security: ${event}`, {
      ...context,
      event,
      component: 'Security',
    });
  }

  /**
   * Create child logger with default context
   */
  static child(defaultContext: LogContext): {
    info: (message: string, context?: LogContext) => void;
    error: (message: string, error?: Error, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    debug: (message: string, context?: LogContext) => void;
  } {
    return {
      info: (message: string, context?: LogContext) => {
        this.info(message, { ...defaultContext, ...context });
      },
      error: (message: string, error?: Error, context?: LogContext) => {
        this.error(message, error, { ...defaultContext, ...context });
      },
      warn: (message: string, context?: LogContext) => {
        this.warn(message, { ...defaultContext, ...context });
      },
      debug: (message: string, context?: LogContext) => {
        this.debug(message, { ...defaultContext, ...context });
      },
    };
  }

  /**
   * Get log statistics
   */
  static getStats(): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
  } {
    // This would typically query a log aggregation service
    // For now, return basic stats
    return {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
    };
  }

  /**
   * Clear old logs
   */
  static clearOldLogs(daysToKeep: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // This would typically be handled by log rotation
    // For now, just log the action
    this.info(`Clearing logs older than ${daysToKeep} days`, {
      operation: 'clearOldLogs',
      cutoffDate: cutoffDate.toISOString(),
    });
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  /**
   * End timing and log performance
   */
  static endTimer(operation: string, context?: LogContext): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      Logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    Logger.performance(operation, duration, context);
    return duration;
  }

  /**
   * Time an async operation
   */
  static async timeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      this.endTimer(operation, context);
      return result;
    } catch (error) {
      this.endTimer(operation, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Time a sync operation
   */
  static timeSync<T>(
    operation: string,
    fn: () => T,
    context?: LogContext
  ): T {
    this.startTimer(operation);
    try {
      const result = fn();
      this.endTimer(operation, context);
      return result;
    } catch (error) {
      this.endTimer(operation, { ...context, error: true });
      throw error;
    }
  }
}

/**
 * Export logger instance for direct use
 */
export const logger = Logger.getInstance();
