import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  Unsubscribe,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  clearIndexedDbPersistence,
  runTransaction,
  Transaction,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@/integrations/firebase/client';
import { requestCache } from '@/utils/requestCache';

/**
 * Advanced Firebase service with intelligent caching, batching, and optimization
 */
class OptimizedFirebaseService {
  private subscriptions = new Map<string, Unsubscribe>();
  private queryCache = new Map<string, any>();
  private batchQueue: Array<() => Promise<any>> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private pendingOperations = new Map<string, Promise<any>>();
  private offlineQueue: Array<{ operation: string; data: any; timestamp: number }> = [];
  private isOnline = true;

  // Cache TTL configurations for different data types
  private readonly cacheTTL = {
    userProfile: 30 * 60 * 1000,      // 30 minutes - user data changes infrequently
    syllabus: 24 * 60 * 60 * 1000,    // 24 hours - syllabus data is static
    pdfMetadata: 12 * 60 * 60 * 1000, // 12 hours - PDF metadata rarely changes
    flashcardProgress: 5 * 60 * 1000,  // 5 minutes - progress updates frequently
    chatMessages: 2 * 60 * 1000,       // 2 minutes - chat needs freshness
    timeTracking: 1 * 60 * 1000,       // 1 minute - time tracking is dynamic
    authentication: 60 * 60 * 1000,    // 1 hour - auth state changes occasionally
    default: 5 * 60 * 1000              // 5 minutes - default for other data
  };

  constructor() {
    this.initializeOfflinePersistence();
    this.setupNetworkMonitoring();
  }

  /**
   * Initialize offline persistence for better performance
   */
  private async initializeOfflinePersistence(): Promise<void> {
    try {
      await enableIndexedDbPersistence(db);
      console.log('[OptimizedFirebaseService] Offline persistence enabled');
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        console.warn('[OptimizedFirebaseService] Multiple tabs open, persistence disabled');
      } else if (error.code === 'unimplemented') {
        console.warn('[OptimizedFirebaseService] Browser doesn\'t support persistence');
      } else {
        console.error('[OptimizedFirebaseService] Persistence error:', error);
      }
    }
  }

  /**
   * Setup network monitoring for offline/online handling
   */
  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      this.isOnline = navigator.onLine;
      if (this.isOnline) {
        this.processOfflineQueue();
      }
      console.log(`[OptimizedFirebaseService] Network status: ${this.isOnline ? 'online' : 'offline'}`);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  /**
   * Process queued operations when coming back online
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`[OptimizedFirebaseService] Processing ${this.offlineQueue.length} offline operations`);

    const operations = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of operations) {
      try {
        // Re-execute the operation
        await this.executeQueuedOperation(operation);
      } catch (error) {
        console.error('[OptimizedFirebaseService] Failed to process offline operation:', error);
        // Re-queue failed operations
        this.offlineQueue.push(operation);
      }
    }
  }

  /**
   * Execute a queued operation
   */
  private async executeQueuedOperation(operation: any): Promise<void> {
    // Implementation depends on operation type
    // This is a placeholder for the actual operation execution
    console.log('[OptimizedFirebaseService] Executing queued operation:', operation.operation);
  }

  /**
   * Get appropriate cache TTL for data type
   */
  private getCacheTTL(dataType: string): number {
    return this.cacheTTL[dataType as keyof typeof this.cacheTTL] || this.cacheTTL.default;
  }

  /**
   * Enhanced document retrieval with intelligent caching
   */
  async getDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    options: {
      cache?: boolean;
      dataType?: string;
      realtime?: boolean;
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<T | null> {
    const {
      cache = true,
      dataType = 'default',
      realtime = false,
      priority = 'normal'
    } = options;

    const cacheKey = `doc:${collectionName}:${docId}`;
    const cacheTTL = this.getCacheTTL(dataType);

    // Check for pending identical requests to prevent duplication
    if (this.pendingOperations.has(cacheKey)) {
      console.log(`[OptimizedFirebaseService] Deduplicating request for ${cacheKey}`);
      return this.pendingOperations.get(cacheKey);
    }

    if (realtime) {
      return this.getDocumentRealtime<T>(collectionName, docId);
    }

    if (cache) {
      const operation = requestCache.get(
        cacheKey,
        async () => {
          console.log(`[OptimizedFirebaseService] Fetching document: ${collectionName}/${docId}`);
          const docRef = doc(db, collectionName, docId);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docSnap.data() as T : null;
        },
        cacheTTL,
        {
          compress: dataType === 'syllabus' || dataType === 'pdfMetadata',
          batch: priority === 'low',
          priority
        }
      );

      // Store pending operation
      this.pendingOperations.set(cacheKey, operation);

      try {
        const result = await operation;
        this.pendingOperations.delete(cacheKey);
        return result;
      } catch (error) {
        this.pendingOperations.delete(cacheKey);
        throw error;
      }
    }

    // Direct fetch without caching
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as T : null;
  }

  /**
   * Real-time document subscription with automatic cleanup
   */
  private getDocumentRealtime<T = DocumentData>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const docRef = doc(db, collectionName, docId);
      const subscriptionKey = `realtime:${collectionName}:${docId}`;

      // Clean up existing subscription
      const existingUnsub = this.subscriptions.get(subscriptionKey);
      if (existingUnsub) {
        existingUnsub();
      }

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          const data = docSnap.exists() ? docSnap.data() as T : null;
          resolve(data);
        },
        (error) => {
          reject(error);
        }
      );

      this.subscriptions.set(subscriptionKey, unsubscribe);
    });
  }

  /**
   * Optimized collection query with pagination and caching
   */
  async queryCollection<T = DocumentData>(
    collectionName: string,
    options: {
      where?: Array<[string, any, any]>;
      orderBy?: Array<[string, 'asc' | 'desc']>;
      limit?: number;
      startAfter?: QueryDocumentSnapshot;
      cache?: boolean;
      cacheTTL?: number;
      batch?: boolean;
    } = {}
  ): Promise<{ docs: T[]; lastDoc?: QueryDocumentSnapshot }> {
    const {
      where: whereConditions = [],
      orderBy: orderByConditions = [],
      limit: limitCount,
      startAfter: startAfterDoc,
      cache = true,
      cacheTTL = 2 * 60 * 1000, // 2 minutes for collections
      batch = false
    } = options;

    // Create cache key from query parameters
    const cacheKey = this.createQueryCacheKey(collectionName, options);

    const executeQuery = async () => {
      let q = collection(db, collectionName);

      // Apply where conditions
      for (const [field, operator, value] of whereConditions) {
        q = query(q, where(field, operator, value));
      }

      // Apply order by conditions
      for (const [field, direction] of orderByConditions) {
        q = query(q, orderBy(field, direction));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      // Apply pagination
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { docs, lastDoc };
    };

    if (cache && !startAfterDoc) { // Don't cache paginated queries
      return requestCache.get(
        cacheKey,
        executeQuery,
        cacheTTL,
        { 
          batch,
          priority: batch ? 'low' : 'normal',
          compress: true
        }
      );
    }

    return executeQuery();
  }

  /**
   * Enhanced batch write operations with intelligent queuing
   */
  async batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high';
  }>): Promise<void> {
    // If offline, queue the operations
    if (!this.isOnline) {
      this.offlineQueue.push({
        operation: 'batchWrite',
        data: operations,
        timestamp: Date.now()
      });
      console.log('[OptimizedFirebaseService] Queued batch write for offline processing');
      return;
    }

    console.log(`[OptimizedFirebaseService] Executing batch write with ${operations.length} operations`);

    const batch = writeBatch(db);

    for (const operation of operations) {
      const docRef = doc(db, operation.collection, operation.docId);

      switch (operation.type) {
        case 'set':
          batch.set(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp()
          });
          break;
        case 'update':
          batch.update(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp()
          });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    }

    await batch.commit();

    // Invalidate related cache entries
    for (const operation of operations) {
      const cacheKey = `doc:${operation.collection}:${operation.docId}`;
      requestCache.invalidate(cacheKey);
      requestCache.invalidatePattern(`query:${operation.collection}:*`);
    }
  }

  /**
   * Optimized Firebase Storage operations with caching
   */
  async getStorageDownloadURL(
    path: string,
    options: {
      cache?: boolean;
      dataType?: string;
    } = {}
  ): Promise<string> {
    const { cache = true, dataType = 'default' } = options;
    const cacheKey = `storage:${path}`;
    const cacheTTL = this.getCacheTTL(dataType);

    if (cache) {
      return requestCache.get(
        cacheKey,
        async () => {
          console.log(`[OptimizedFirebaseService] Fetching storage URL: ${path}`);
          const storageRef = ref(storage, path);
          return await getDownloadURL(storageRef);
        },
        cacheTTL,
        { compress: false } // URLs are small, no need to compress
      );
    }

    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }

  /**
   * Batch storage operations
   */
  async batchStorageOperations(operations: Array<{
    type: 'upload' | 'delete' | 'getURL';
    path: string;
    data?: Blob | Uint8Array | ArrayBuffer;
  }>): Promise<Array<string | void>> {
    console.log(`[OptimizedFirebaseService] Executing batch storage operations: ${operations.length}`);

    const promises = operations.map(async (operation) => {
      const storageRef = ref(storage, operation.path);

      switch (operation.type) {
        case 'upload':
          if (operation.data) {
            await uploadBytes(storageRef, operation.data);
            return await getDownloadURL(storageRef);
          }
          break;
        case 'delete':
          await deleteObject(storageRef);
          // Invalidate cache
          requestCache.invalidate(`storage:${operation.path}`);
          break;
        case 'getURL':
          return await this.getStorageDownloadURL(operation.path, { cache: true });
      }
    });

    return Promise.all(promises);
  }

  /**
   * Create a consistent cache key for queries
   */
  private createQueryCacheKey(collectionName: string, options: any): string {
    const parts = [`query:${collectionName}`];
    
    if (options.where) {
      parts.push(`where:${JSON.stringify(options.where)}`);
    }
    
    if (options.orderBy) {
      parts.push(`orderBy:${JSON.stringify(options.orderBy)}`);
    }
    
    if (options.limit) {
      parts.push(`limit:${options.limit}`);
    }

    return parts.join(':');
  }

  /**
   * Preload data for better performance
   */
  async preloadData(queries: Array<{
    type: 'document' | 'collection';
    collectionName: string;
    docId?: string;
    options?: any;
  }>): Promise<void> {
    const promises = queries.map(async (query) => {
      try {
        if (query.type === 'document' && query.docId) {
          await this.getDocument(query.collectionName, query.docId, {
            ...query.options,
            cache: true
          });
        } else if (query.type === 'collection') {
          await this.queryCollection(query.collectionName, {
            ...query.options,
            cache: true,
            batch: true
          });
        }
      } catch (error) {
        console.warn(`[OptimizedFirebaseService] Preload failed for ${query.type}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log(`[OptimizedFirebaseService] Preloaded ${queries.length} queries`);
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    for (const [key, unsubscribe] of this.subscriptions) {
      unsubscribe();
      console.log(`[OptimizedFirebaseService] Cleaned up subscription: ${key}`);
    }
    this.subscriptions.clear();
    this.queryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      subscriptions: this.subscriptions.size,
      queryCache: this.queryCache.size,
      requestCache: requestCache.getStats()
    };
  }
}

// Export singleton instance
export const optimizedFirebaseService = new OptimizedFirebaseService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    optimizedFirebaseService.cleanup();
  });
}
