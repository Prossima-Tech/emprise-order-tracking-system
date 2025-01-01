// src/utils/monitoring.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

// Create a custom logger with daily rotation and different severity levels
export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    })
  ),
  transports: [
    // Daily rotating file for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d', // Keep logs for 30 days
      maxSize: '20m' // 20MB
    }),
    // Daily rotating file for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d', // Keep logs for 7 days
      maxSize: '20m'
    }),
    // Console transport for development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request details
  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Track response time and status
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });

    // Alert on slow responses (over 1 second)
    if (duration > 1000) {
      logger.warn('Slow response detected', {
        requestId,
        method: req.method,
        path: req.path,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  });

  // Track unhandled errors
  res.on('error', (error) => {
    logger.error('Response error', {
      requestId,
      method: req.method,
      path: req.path,
      error: error.message,
      stack: error.stack
    });
  });

  next();
};

// Custom performance metrics
export class PerformanceMetrics {
  private static metrics: Record<string, {
    count: number;
    totalDuration: number;
    maxDuration: number;
    errors: number;
  }> = {};

  static trackOperation(operation: string, duration: number, error?: Error) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        errors: 0
      };
    }

    const metric = this.metrics[operation];
    metric.count++;
    metric.totalDuration += duration;
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    if (error) {
      metric.errors++;
    }
  }

  static getMetrics() {
    const result: Record<string, any> = {};
    
    Object.entries(this.metrics).forEach(([operation, metric]) => {
      result[operation] = {
        count: metric.count,
        averageDuration: metric.totalDuration / metric.count,
        maxDuration: metric.maxDuration,
        errorRate: (metric.errors / metric.count) * 100,
        successRate: ((metric.count - metric.errors) / metric.count) * 100
      };
    });

    return result;
  }

  static resetMetrics() {
    this.metrics = {};
  }
}

// Route timing decorator for performance tracking
export function trackTiming(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        PerformanceMetrics.trackOperation(operation, duration);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        PerformanceMetrics.trackOperation(operation, duration, error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}