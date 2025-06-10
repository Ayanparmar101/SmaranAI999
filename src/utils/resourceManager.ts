/**
 * Advanced resource manager for memory optimization and leak prevention
 */

interface ResourceCleanup {
  id: string;
  cleanup: () => void;
  type: 'timer' | 'listener' | 'subscription' | 'observer' | 'worker' | 'stream';
  created: number;
}

class ResourceManager {
  private static instance: ResourceManager | null = null;
  private resources = new Map<string, ResourceCleanup>();
  private memoryMonitor: PerformanceObserver | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupMemoryMonitoring();
    this.startPeriodicCleanup();
    this.setupPageUnloadCleanup();
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  /**
   * Register a resource for automatic cleanup
   */
  register(
    id: string,
    cleanup: () => void,
    type: ResourceCleanup['type'] = 'subscription'
  ): string {
    const resource: ResourceCleanup = {
      id,
      cleanup,
      type,
      created: Date.now()
    };

    this.resources.set(id, resource);
    console.log(`[ResourceManager] Registered ${type}: ${id}`);
    
    return id;
  }

  /**
   * Unregister and cleanup a specific resource
   */
  unregister(id: string): boolean {
    const resource = this.resources.get(id);
    if (resource) {
      try {
        resource.cleanup();
        this.resources.delete(id);
        console.log(`[ResourceManager] Cleaned up ${resource.type}: ${id}`);
        return true;
      } catch (error) {
        console.error(`[ResourceManager] Error cleaning up ${resource.type} ${id}:`, error);
      }
    }
    return false;
  }

  /**
   * Register a timer with automatic cleanup
   */
  registerTimer(callback: () => void, delay: number, interval: boolean = false): string {
    const id = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timerId = interval 
      ? setInterval(callback, delay)
      : setTimeout(callback, delay);

    const cleanup = () => {
      if (interval) {
        clearInterval(timerId as NodeJS.Timeout);
      } else {
        clearTimeout(timerId as NodeJS.Timeout);
      }
    };

    return this.register(id, cleanup, 'timer');
  }

  /**
   * Register an event listener with automatic cleanup
   */
  registerEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): string {
    const id = `listener_${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    target.addEventListener(event, listener, options);
    
    const cleanup = () => {
      target.removeEventListener(event, listener, options);
    };

    return this.register(id, cleanup, 'listener');
  }

  /**
   * Register an Intersection Observer with automatic cleanup
   */
  registerIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): { id: string; observer: IntersectionObserver } {
    const id = `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const observer = new IntersectionObserver(callback, options);
    
    const cleanup = () => {
      observer.disconnect();
    };

    this.register(id, cleanup, 'observer');
    
    return { id, observer };
  }

  /**
   * Register a Web Worker with automatic cleanup
   */
  registerWorker(worker: Worker): string {
    const id = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const cleanup = () => {
      worker.terminate();
    };

    return this.register(id, cleanup, 'worker');
  }

  /**
   * Register a stream with automatic cleanup
   */
  registerStream(stream: ReadableStream | WritableStream): string {
    const id = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const cleanup = () => {
      try {
        if ('cancel' in stream) {
          (stream as ReadableStream).cancel();
        } else if ('abort' in stream) {
          (stream as WritableStream).abort();
        }
      } catch (error) {
        console.warn('[ResourceManager] Error closing stream:', error);
      }
    };

    return this.register(id, cleanup, 'stream');
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      this.memoryMonitor = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.includes('memory')) {
            this.checkMemoryUsage();
          }
        }
      });

      this.memoryMonitor.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('[ResourceManager] Memory monitoring not available:', error);
    }
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const memory = (performance as any).memory;
    if (!memory) return;

    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usagePercent = (usedMB / limitMB) * 100;

    console.log(`[ResourceManager] Memory usage: ${usedMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);

    // Trigger aggressive cleanup if memory usage is high
    if (usagePercent > 80) {
      console.warn('[ResourceManager] High memory usage detected, triggering cleanup');
      this.cleanupOldResources(60000); // Cleanup resources older than 1 minute
    }
  }

  /**
   * Cleanup resources older than specified age
   */
  private cleanupOldResources(maxAge: number): void {
    const now = Date.now();
    const toCleanup: string[] = [];

    for (const [id, resource] of this.resources) {
      if (now - resource.created > maxAge) {
        toCleanup.push(id);
      }
    }

    console.log(`[ResourceManager] Cleaning up ${toCleanup.length} old resources`);
    toCleanup.forEach(id => this.unregister(id));
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldResources(5 * 60 * 1000); // Cleanup resources older than 5 minutes
      this.checkMemoryUsage();
    }, 60000); // Run every minute
  }

  /**
   * Setup cleanup on page unload
   */
  private setupPageUnloadCleanup(): void {
    if (typeof window === 'undefined') return;

    const cleanup = () => {
      this.cleanupAll();
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    
    // Register the page unload listeners for cleanup
    this.registerEventListener(window, 'beforeunload', cleanup);
    this.registerEventListener(window, 'pagehide', cleanup);
  }

  /**
   * Cleanup all registered resources
   */
  cleanupAll(): void {
    console.log(`[ResourceManager] Cleaning up all ${this.resources.size} resources`);
    
    for (const [id, resource] of this.resources) {
      try {
        resource.cleanup();
      } catch (error) {
        console.error(`[ResourceManager] Error cleaning up ${resource.type} ${id}:`, error);
      }
    }

    this.resources.clear();

    // Cleanup monitoring
    if (this.memoryMonitor) {
      this.memoryMonitor.disconnect();
      this.memoryMonitor = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Get resource statistics
   */
  getStats() {
    const stats = {
      total: this.resources.size,
      byType: {} as Record<string, number>,
      oldestResource: 0,
      newestResource: 0
    };

    let oldest = Date.now();
    let newest = 0;

    for (const resource of this.resources.values()) {
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;
      oldest = Math.min(oldest, resource.created);
      newest = Math.max(newest, resource.created);
    }

    stats.oldestResource = oldest;
    stats.newestResource = newest;

    return stats;
  }
}

// Export singleton instance
export const resourceManager = ResourceManager.getInstance();

// React hook for automatic resource management
export function useResourceManager() {
  const React = require('react');
  const { useEffect, useRef } = React;
  
  const resourceIds = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup all registered resources when component unmounts
      resourceIds.current.forEach(id => {
        resourceManager.unregister(id);
      });
      resourceIds.current = [];
    };
  }, []);

  const registerResource = (
    cleanup: () => void,
    type: ResourceCleanup['type'] = 'subscription'
  ): string => {
    const id = resourceManager.register(
      `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cleanup,
      type
    );
    resourceIds.current.push(id);
    return id;
  };

  return {
    registerResource,
    registerTimer: (callback: () => void, delay: number, interval?: boolean) => {
      const id = resourceManager.registerTimer(callback, delay, interval);
      resourceIds.current.push(id);
      return id;
    },
    registerEventListener: (
      target: EventTarget,
      event: string,
      listener: EventListener,
      options?: AddEventListenerOptions
    ) => {
      const id = resourceManager.registerEventListener(target, event, listener, options);
      resourceIds.current.push(id);
      return id;
    },
    unregister: resourceManager.unregister.bind(resourceManager)
  };
}
