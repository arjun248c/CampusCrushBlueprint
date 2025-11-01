import type { Request, Response, NextFunction } from 'express';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
}

interface ErrorLog {
  message: string;
  stack?: string;
  endpoint: string;
  method: string;
  userId?: string;
  timestamp: Date;
  statusCode: number;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorLog[] = [];
  private readonly maxMetrics = 1000;
  private readonly maxErrors = 500;

  // Performance monitoring middleware
  performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const metric: PerformanceMetric = {
          endpoint: req.path,
          method: req.method,
          duration,
          statusCode: res.statusCode,
          timestamp: new Date(),
          userId: (req as any).user?.claims?.sub,
        };
        
        this.addMetric(metric);
        
        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }
      });
      
      next();
    };
  }

  // Error handling middleware
  errorMiddleware() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      const errorLog: ErrorLog = {
        message: error.message,
        stack: error.stack,
        endpoint: req.path,
        method: req.method,
        userId: (req as any).user?.claims?.sub,
        timestamp: new Date(),
        statusCode: res.statusCode || 500,
      };
      
      this.addError(errorLog);
      
      console.error('API Error:', {
        message: error.message,
        endpoint: req.path,
        method: req.method,
        userId: errorLog.userId,
        stack: error.stack,
      });
      
      if (!res.headersSent) {
        res.status(500).json({ 
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        });
      }
    };
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  private addError(error: ErrorLog) {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  // Get performance statistics
  getPerformanceStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequests: 0,
      };
    }
    
    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const errorRequests = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;
    const slowRequests = recentMetrics.filter(m => m.duration > 1000).length;
    
    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      timeWindow: '1 hour',
    };
  }

  // Get recent errors
  getRecentErrors(limit: number = 10) {
    return this.errors
      .slice(-limit)
      .reverse()
      .map(error => ({
        message: error.message,
        endpoint: error.endpoint,
        method: error.method,
        timestamp: error.timestamp,
        statusCode: error.statusCode,
        userId: error.userId,
      }));
  }

  // Get endpoint performance breakdown
  getEndpointStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    const endpointStats = new Map<string, { count: number; totalTime: number; errors: number }>();
    
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { count: 0, totalTime: 0, errors: 0 };
      
      existing.count++;
      existing.totalTime += metric.duration;
      if (metric.statusCode >= 400) {
        existing.errors++;
      }
      
      endpointStats.set(key, existing);
    });
    
    return Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
      endpoint,
      requestCount: stats.count,
      averageResponseTime: Math.round(stats.totalTime / stats.count),
      errorCount: stats.errors,
      errorRate: Math.round((stats.errors / stats.count) * 100 * 100) / 100,
    })).sort((a, b) => b.requestCount - a.requestCount);
  }
}

export const monitoring = new MonitoringService();