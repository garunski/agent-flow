/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = () => true,
  } = options;

  let lastError: Error;
  let delay = baseDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's the last attempt or retry condition is false
      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw new RetryError(
          `Operation failed after ${attempt + 1} attempts`,
          lastError,
          attempt + 1
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold = 5,
    private readonly timeout = 60000,
    private readonly resetTimeout = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}

/**
 * Default retry conditions for common scenarios
 */
export const retryConditions = {
  networkError: (error: Error) => {
    return error.message.includes('network') || 
           error.message.includes('timeout') ||
           error.message.includes('ECONNRESET');
  },
  
  serverError: (error: Error) => {
    return error.message.includes('5') || 
           error.message.includes('server error');
  },
  
  temporaryError: (error: Error) => {
    return error.message.includes('temporary') ||
           error.message.includes('unavailable') ||
           error.message.includes('busy');
  },
  
  always: () => true,
  
  never: () => false,
};
