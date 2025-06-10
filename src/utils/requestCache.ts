/**
 * Advanced request cache utility with batching, compression, and intelligent caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
}

interface BatchRequest {
  key: string;
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private maxCacheSize = 1000;
  private compressionThreshold = 10000; // 10KB

  /**
   * Compress data if it's large enough
   */
  private async compressData(data: any): Promise<{ data: any; compressed: boolean }> {
    const serialized = JSON.stringify(data);
    if (serialized.length > this.compressionThreshold) {
      try {
        // Use browser's compression API if available
        if ('CompressionStream' in window) {
          const stream = new CompressionStream('gzip');
          const writer = stream.writable.getWriter();
          const reader = stream.readable.getReader();

          writer.write(new TextEncoder().encode(serialized));
          writer.close();

          const chunks: Uint8Array[] = [];
          let done = false;

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) chunks.push(value);
          }

          const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            compressed.set(chunk, offset);
            offset += chunk.length;
          }

          return { data: compressed, compressed: true };
        }
      } catch (error) {
        console.warn('[RequestCache] Compression failed, storing uncompressed:', error);
      }
    }

    return { data, compressed: false };
  }

  /**
   * Decompress data if it was compressed
   */
  private async decompressData(entry: CacheEntry<any>): Promise<any> {
    if (!entry.compressed) return entry.data;

    try {
      if ('DecompressionStream' in window) {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(entry.data);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }

        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }

        const text = new TextDecoder().decode(decompressed);
        return JSON.parse(text);
      }
    } catch (error) {
      console.error('[RequestCache] Decompression failed:', error);
    }

    return entry.data;
  }

  /**
   * Get cached data or execute request if not cached with advanced features
   */
  async get<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000, // 5 minutes default TTL
    options: {
      batch?: boolean;
      priority?: 'low' | 'normal' | 'high';
      compress?: boolean;
    } = {}
  ): Promise<T> {
    const now = Date.now();

    // Check if we have valid cached data
    const cached = this.cache.get(key);
    if (cached && now < cached.expiresAt) {
      // Update access statistics
      cached.accessCount++;
      cached.lastAccessed = now;

      console.log(`[RequestCache] Cache hit for key: ${key} (accessed ${cached.accessCount} times)`);

      // Decompress if needed
      const data = await this.decompressData(cached);
      return data;
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`[RequestCache] Request deduplication for key: ${key}`);
      return pending;
    }

    // Handle batching for low priority requests
    if (options.batch && options.priority === 'low') {
      return this.addToBatch(key, requestFn, ttl, options);
    }

    // Execute new request
    console.log(`[RequestCache] Cache miss, executing request for key: ${key}`);
    const requestPromise = this.executeRequest(key, requestFn, ttl, options);

    // Store pending request for deduplication
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Execute a single request with caching
   */
  private async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number,
    options: { compress?: boolean } = {}
  ): Promise<T> {
    try {
      const data = await requestFn();
      const now = Date.now();

      // Compress data if requested and large enough
      const { data: cachedData, compressed } = options.compress
        ? await this.compressData(data)
        : { data, compressed: false };

      // Cache the result
      const cacheEntry: CacheEntry<any> = {
        data: cachedData,
        timestamp: now,
        expiresAt: now + ttl,
        accessCount: 1,
        lastAccessed: now,
        compressed
      };

      this.cache.set(key, cacheEntry);
      this.enforceMaxCacheSize();

      // Remove from pending requests
      this.pendingRequests.delete(key);

      return data;
    } catch (error) {
      // Remove from pending requests on error
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  /**
   * Add request to batch queue for processing
   */
  private addToBatch<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number,
    options: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        key,
        requestFn,
        resolve,
        reject
      });

      // Process batch after a short delay
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, 50); // 50ms batch window
      }
    });
  }

  /**
   * Process batched requests
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;

    console.log(`[RequestCache] Processing batch of ${batch.length} requests`);

    // Execute all requests in parallel
    const promises = batch.map(async (item) => {
      try {
        const result = await this.executeRequest(item.key, item.requestFn, 5 * 60 * 1000);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Enforce maximum cache size by removing least recently used items
   */
  private enforceMaxCacheSize(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Sort by last accessed time (LRU)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Remove oldest entries
    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }

    console.log(`[RequestCache] Evicted ${toRemove.length} entries from cache`);
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
    console.log(`[RequestCache] Invalidated cache for key: ${key}`);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });
    
    console.log(`[RequestCache] Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('[RequestCache] Cleared all cache');
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`[RequestCache] Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() >= entry.expiresAt
      }))
    };
  }
}

// Global cache instance
export const requestCache = new RequestCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  requestCache.cleanup();
}, 5 * 60 * 1000);

/**
 * Hook for using request cache in React components
 */
export function useCachedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl?: number,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      if (!key) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await requestCache.get(key, requestFn, ttl);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Request failed'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [key, ttl, ...dependencies]);

  const invalidate = React.useCallback(() => {
    requestCache.invalidate(key);
  }, [key]);

  return { data, loading, error, invalidate };
}

// Import React for the hook
import React from 'react';
