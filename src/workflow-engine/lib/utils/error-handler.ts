/**
 * Enhanced error handling with recovery suggestions
 */

export interface ErrorContext {
  operation: string;
  component: string;
  timestamp: Date;
  userId?: string;
  workflowId?: string;
  nodeId?: string;
}

export interface ErrorRecovery {
  suggestion: string;
  command?: string;
  documentation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class EnhancedError extends Error {
  public readonly context: ErrorContext;
  public readonly recovery: ErrorRecovery[];
  public readonly originalError?: Error;

  constructor(
    message: string,
    context: ErrorContext,
    recovery: ErrorRecovery[],
    originalError?: Error
  ) {
    super(message);
    this.name = 'EnhancedError';
    this.context = context;
    this.recovery = recovery;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      recovery: this.recovery,
      originalError: this.originalError?.message,
      stack: this.stack,
    };
  }
}

/**
 * Error recovery suggestions database
 */
export const errorRecoveries: Record<string, ErrorRecovery[]> = {
  'ENOENT': [
    {
      suggestion: 'File or directory not found. Check if the path exists and is accessible.',
      command: 'ls -la <path>',
      documentation: 'docs/TROUBLESHOOTING.md#file-not-found',
      severity: 'medium',
    },
  ],
  'EACCES': [
    {
      suggestion: 'Permission denied. Check file permissions and user access.',
      command: 'chmod 755 <path>',
      documentation: 'docs/TROUBLESHOOTING.md#permission-denied',
      severity: 'high',
    },
  ],
  'ECONNREFUSED': [
    {
      suggestion: 'Connection refused. Check if the service is running and accessible.',
      command: 'task health',
      documentation: 'docs/TROUBLESHOOTING.md#connection-refused',
      severity: 'high',
    },
  ],
  'ETIMEDOUT': [
    {
      suggestion: 'Request timeout. The service may be overloaded or unresponsive.',
      command: 'task logs',
      documentation: 'docs/TROUBLESHOOTING.md#timeout',
      severity: 'medium',
    },
  ],
  'ENOTFOUND': [
    {
      suggestion: 'Host not found. Check network connectivity and DNS resolution.',
      command: 'ping <hostname>',
      documentation: 'docs/TROUBLESHOOTING.md#host-not-found',
      severity: 'high',
    },
  ],
  'glob-not-found': [
    {
      suggestion: 'Glob pattern not found. Check if the glob package is installed.',
      command: 'npm install glob',
      documentation: 'docs/TROUBLESHOOTING.md#missing-dependencies',
      severity: 'critical',
    },
  ],
  'cursor-cli-not-found': [
    {
      suggestion: 'Cursor CLI not found. Install Cursor CLI and ensure it\'s in PATH.',
      command: 'cursor-agent --version',
      documentation: 'docs/TROUBLESHOOTING.md#cursor-cli-issues',
      severity: 'critical',
    },
  ],
  'docker-not-running': [
    {
      suggestion: 'Docker is not running. Start Docker Desktop and wait for it to fully load.',
      command: 'docker ps',
      documentation: 'docs/TROUBLESHOOTING.md#docker-issues',
      severity: 'critical',
    },
  ],
  'port-already-in-use': [
    {
      suggestion: 'Port is already in use. Stop the conflicting service or use a different port.',
      command: 'lsof -i :<port>',
      documentation: 'docs/TROUBLESHOOTING.md#port-conflicts',
      severity: 'high',
    },
  ],
  'workflow-validation-failed': [
    {
      suggestion: 'Workflow validation failed. Check workflow syntax and structure.',
      command: 'task validate-workflows',
      documentation: 'docs/TROUBLESHOOTING.md#workflow-issues',
      severity: 'high',
    },
  ],
  'n8n-api-error': [
    {
      suggestion: 'N8N API error. Check N8N service status and API connectivity.',
      command: 'curl -f http://localhost:5678/healthz',
      documentation: 'docs/TROUBLESHOOTING.md#n8n-issues',
      severity: 'high',
    },
  ],
  'database-connection-failed': [
    {
      suggestion: 'Database connection failed. Check PostgreSQL service and credentials.',
      command: 'docker-compose exec postgres pg_isready -U n8n',
      documentation: 'docs/TROUBLESHOOTING.md#database-issues',
      severity: 'critical',
    },
  ],
  'environment-variable-missing': [
    {
      suggestion: 'Required environment variable is missing. Check .env file and configuration.',
      command: 'task verify-setup',
      documentation: 'docs/TROUBLESHOOTING.md#environment-issues',
      severity: 'medium',
    },
  ],
};

/**
 * Enhanced error handler
 */
export class ErrorHandler {
  /**
   * Create an enhanced error with recovery suggestions
   */
  static createEnhancedError(
    message: string,
    context: ErrorContext,
    originalError?: Error
  ): EnhancedError {
    const errorCode = this.extractErrorCode(originalError);
    const recovery = errorRecoveries[errorCode] || [
      {
        suggestion: 'Check the logs for more details and consult the troubleshooting guide.',
        documentation: 'docs/TROUBLESHOOTING.md',
        severity: 'medium',
      },
    ];

    return new EnhancedError(message, context, recovery, originalError);
  }

  /**
   * Extract error code from error
   */
  private static extractErrorCode(error?: Error): string {
    if (!error) return 'unknown';

    // Check for specific error codes
    if (error.message.includes('glob')) return 'glob-not-found';
    if (error.message.includes('cursor-agent')) return 'cursor-cli-not-found';
    if (error.message.includes('Docker')) return 'docker-not-running';
    if (error.message.includes('port')) return 'port-already-in-use';
    if (error.message.includes('workflow')) return 'workflow-validation-failed';
    if (error.message.includes('N8N')) return 'n8n-api-error';
    if (error.message.includes('database')) return 'database-connection-failed';
    if (error.message.includes('environment')) return 'environment-variable-missing';

    // Extract system error codes
    const match = error.message.match(/^([A-Z]+):/);
    if (match) return match[1];

    return 'unknown';
  }

  /**
   * Format error for logging
   */
  static formatError(error: EnhancedError): string {
    let output = `🚨 ${error.name}: ${error.message}\n`;
    output += `📍 Context: ${error.context.component} - ${error.context.operation}\n`;
    output += `⏰ Time: ${error.context.timestamp.toISOString()}\n\n`;

    if (error.recovery.length > 0) {
      output += `💡 Recovery Suggestions:\n`;
      error.recovery.forEach((recovery, index) => {
        output += `  ${index + 1}. ${recovery.suggestion}\n`;
        if (recovery.command) {
          output += `     Command: ${recovery.command}\n`;
        }
        if (recovery.documentation) {
          output += `     Docs: ${recovery.documentation}\n`;
        }
        output += `     Severity: ${recovery.severity.toUpperCase()}\n\n`;
      });
    }

    if (error.originalError) {
      output += `🔍 Original Error: ${error.originalError.message}\n`;
    }

    return output;
  }

  /**
   * Handle and log error
   */
  static handleError(
    error: Error,
    context: ErrorContext,
    logger?: (message: string) => void
  ): EnhancedError {
    const enhancedError = this.createEnhancedError(
      error.message,
      context,
      error
    );

    const formattedError = this.formatError(enhancedError);
    
    if (logger) {
      logger(formattedError);
    } else {
      console.error(formattedError);
    }

    return enhancedError;
  }

  /**
   * Get recovery suggestions for a specific error
   */
  static getRecoverySuggestions(error: Error): ErrorRecovery[] {
    const errorCode = this.extractErrorCode(error);
    return errorRecoveries[errorCode] || [
      {
        suggestion: 'Check the troubleshooting guide for general solutions.',
        documentation: 'docs/TROUBLESHOOTING.md',
        severity: 'medium',
      },
    ];
  }
}

/**
 * Common error contexts
 */
export const errorContexts = {
  workflowLoader: (operation: string, workflowId?: string): ErrorContext => ({
    operation,
    component: 'WorkflowLoader',
    timestamp: new Date(),
    workflowId,
  }),

  workflowValidator: (operation: string, workflowId?: string): ErrorContext => ({
    operation,
    component: 'WorkflowValidator',
    timestamp: new Date(),
    workflowId,
  }),

  workflowRegistry: (operation: string, workflowId?: string): ErrorContext => ({
    operation,
    component: 'WorkflowRegistry',
    timestamp: new Date(),
    workflowId,
  }),

  cursorExecute: (operation: string, nodeId?: string): ErrorContext => ({
    operation,
    component: 'CursorExecute',
    timestamp: new Date(),
    nodeId,
  }),

  n8nIntegration: (operation: string, nodeId?: string): ErrorContext => ({
    operation,
    component: 'N8NIntegration',
    timestamp: new Date(),
    nodeId,
  }),

  systemValidation: (operation: string): ErrorContext => ({
    operation,
    component: 'SystemValidation',
    timestamp: new Date(),
  }),
};
