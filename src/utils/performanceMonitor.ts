/**
 * Advanced performance monitoring utility with Core Web Vitals, alerts, and budgets
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'memory' | 'vitals' | 'custom';
  tags?: Record<string, string>;
  severity?: 'info' | 'warning' | 'error';
}

interface PerformanceBudget {
  metric: string;
  threshold: number;
  type: 'max' | 'min';
  severity: 'warning' | 'error';
}

interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
  timestamp: number;
  acknowledged: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private alerts: PerformanceAlert[] = [];
  private budgets: PerformanceBudget[] = [];
  private isEnabled: boolean = true;
  private vitalsCollected = new Set<string>();
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  constructor() {
    this.setupObservers();
    this.trackInitialMetrics();
    this.setupDefaultBudgets();
    this.trackCoreWebVitals();
  }

  /**
   * Setup performance observers for automatic monitoring
   */
  private setupObservers() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // Monitor navigation timing
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'timing');
              this.recordMetric('first_paint', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
            }
          }
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Monitor resource loading
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.duration > 1000) { // Only track slow resources
                this.recordMetric('slow_resource_load', resourceEntry.duration, 'timing', {
                  resource: resourceEntry.name,
                  type: resourceEntry.initiatorType
                });
              }
            }
          }
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.recordMetric('long_task', entry.duration, 'timing');
              console.warn(`[PerformanceMonitor] Long task detected: ${entry.duration}ms`);
            }
          }
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
          this.observers.push(longTaskObserver);
        } catch (e) {
          // longtask not supported in all browsers
        }
      }
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup observers:', error);
    }
  }

  /**
   * Track initial performance metrics
   */
  private trackInitialMetrics() {
    if (typeof window === 'undefined') return;

    // Track memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('memory_used', memory.usedJSHeapSize, 'memory');
      this.recordMetric('memory_total', memory.totalJSHeapSize, 'memory');
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'memory');
    }

    // Track connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric('connection_downlink', connection.downlink, 'counter', {
        effectiveType: connection.effectiveType
      });
    }
  }

  /**
   * Setup default performance budgets
   */
  private setupDefaultBudgets(): void {
    this.budgets = [
      { metric: 'page_load_time', threshold: 3000, type: 'max', severity: 'warning' },
      { metric: 'page_load_time', threshold: 5000, type: 'max', severity: 'error' },
      { metric: 'first_contentful_paint', threshold: 1800, type: 'max', severity: 'warning' },
      { metric: 'largest_contentful_paint', threshold: 2500, type: 'max', severity: 'warning' },
      { metric: 'cumulative_layout_shift', threshold: 0.1, type: 'max', severity: 'warning' },
      { metric: 'first_input_delay', threshold: 100, type: 'max', severity: 'warning' },
      { metric: 'memory_used', threshold: 50 * 1024 * 1024, type: 'max', severity: 'warning' }, // 50MB
      { metric: 'long_task', threshold: 50, type: 'max', severity: 'warning' }
    ];
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    this.observeVital('largest-contentful-paint', (entry: any) => {
      this.recordMetric('largest_contentful_paint', entry.value, 'vitals', {
        element: entry.element?.tagName || 'unknown'
      });
    });

    // Track First Input Delay (FID)
    this.observeVital('first-input', (entry: any) => {
      this.recordMetric('first_input_delay', entry.processingStart - entry.startTime, 'vitals', {
        eventType: entry.name
      });
    });

    // Track Cumulative Layout Shift (CLS)
    this.observeVital('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('cumulative_layout_shift', entry.value, 'vitals');
      }
    });

    // Track First Contentful Paint (FCP)
    this.observeVital('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.recordMetric('first_contentful_paint', entry.startTime, 'vitals');
      }
    });
  }

  /**
   * Observe a specific vital metric
   */
  private observeVital(entryType: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`[PerformanceMonitor] Failed to observe ${entryType}:`, error);
    }
  }

  /**
   * Record a performance metric with budget checking
   */
  recordMetric(
    name: string,
    value: number,
    type: PerformanceMetric['type'],
    tags?: Record<string, string>
  ) {
    if (!this.isEnabled) return;

    // Determine severity based on budgets
    let severity: PerformanceMetric['severity'] = 'info';
    const applicableBudgets = this.budgets.filter(b => b.metric === name);

    for (const budget of applicableBudgets) {
      const exceedsBudget = budget.type === 'max' ? value > budget.threshold : value < budget.threshold;
      if (exceedsBudget) {
        severity = budget.severity === 'error' ? 'error' : 'warning';
        this.triggerAlert(name, value, budget.threshold, budget.severity);
      }
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      tags,
      severity
    };

    this.metrics.push(metric);

    // Keep only last 2000 metrics to prevent memory leaks
    if (this.metrics.length > 2000) {
      this.metrics = this.metrics.slice(-2000);
    }

    const logLevel = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'log';
    console[logLevel](`[PerformanceMonitor] ${name}: ${value}${type === 'timing' ? 'ms' : ''}`, tags);
  }

  /**
   * Trigger a performance alert
   */
  private triggerAlert(
    metric: string,
    value: number,
    threshold: number,
    severity: 'warning' | 'error'
  ): void {
    const alertId = `${metric}_${Date.now()}`;
    const alert: PerformanceAlert = {
      id: alertId,
      metric,
      value,
      threshold,
      severity,
      timestamp: Date.now(),
      acknowledged: false
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[PerformanceMonitor] Alert callback error:', error);
      }
    });

    console.warn(`[PerformanceMonitor] ALERT: ${metric} (${value}) exceeded ${severity} threshold (${threshold})`);
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);

    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Start timing a custom operation
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'timing');
    };
  }

  /**
   * Measure React component render time
   */
  measureRender(componentName: string, renderFn: () => void) {
    const endTiming = this.startTiming(`${componentName}_render`);
    renderFn();
    endTiming();
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const endTiming = this.startTiming(`api_${name}`);
    
    try {
      const result = await apiCall();
      this.recordMetric(`api_${name}_success`, 1, 'counter');
      return result;
    } catch (error) {
      this.recordMetric(`api_${name}_error`, 1, 'counter');
      throw error;
    } finally {
      endTiming();
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      averageTimings: {} as Record<string, number>,
      counters: {} as Record<string, number>,
      memoryUsage: {} as Record<string, number>
    };

    // Calculate averages for timing metrics
    const timingMetrics = recentMetrics.filter(m => m.type === 'timing');
    const timingGroups = timingMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    for (const [name, values] of Object.entries(timingGroups)) {
      summary.averageTimings[name] = values.reduce((a, b) => a + b, 0) / values.length;
    }

    // Sum counters
    const counterMetrics = recentMetrics.filter(m => m.type === 'counter');
    for (const metric of counterMetrics) {
      summary.counters[metric.name] = (summary.counters[metric.name] || 0) + metric.value;
    }

    // Latest memory metrics
    const memoryMetrics = recentMetrics.filter(m => m.type === 'memory');
    for (const metric of memoryMetrics) {
      summary.memoryUsage[metric.name] = metric.value;
    }

    return summary;
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.cleanup();
    } else {
      this.setupObservers();
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
    trackApiCall: performanceMonitor.trackApiCall.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor)
  };
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}
