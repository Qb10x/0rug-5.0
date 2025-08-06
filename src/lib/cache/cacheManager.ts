// Cache Management System - Multi-level caching
// Following 0rug.com coding guidelines

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  PRICE: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL_PRICE || '30000'),
  METADATA: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL_METADATA || '300000'),
  ANALYSIS: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL_ANALYSIS || '600000'),
  POOL_DATA: 2 * 60 * 1000,   // 2 minutes for pool data
  AI_RESPONSE: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL_AI_RESPONSE || '900000'),
  HOLDER_DATA: 5 * 60 * 1000,  // 5 minutes for holder data
  TRANSACTION_DATA: 1 * 60 * 1000 // 1 minute for transaction data
};

// Cache keys for different data types
export const CACHE_KEYS = {
  TOKEN_DATA: 'memeBot_token_cache',
  AI_RESPONSE: 'memeBot_ai_cache',
  POOL_DATA: 'memeBot_pool_cache',
  HOLDER_DATA: 'memeBot_holder_cache',
  TRANSACTION_DATA: 'memeBot_transaction_cache'
};

// Cache entry interface
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

// Cache statistics interface
export interface CacheStats {
  totalEntries: number;
  memoryUsage: number;
  hitRate: number;
  lastCleanup: number;
}

// Cache manager class
export class CacheManager {
  private memoryCache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private readonly CACHE_VERSION = '1.0.0';

  constructor() {
    this.memoryCache = new Map();
    this.stats = {
      totalEntries: 0,
      memoryUsage: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.CACHE_VERSION
    };

    this.memoryCache.set(key, entry);
    this.updateStats();
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      return null;
    }

    // Check if cache is valid
    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update hit rate
    this.updateHitRate(true);
    return entry.data;
  }

  // Check if cache entry exists and is valid
  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  // Delete cache entry
  delete(key: string): boolean {
    const deleted = this.memoryCache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  // Clear all cache entries
  clear(): void {
    this.memoryCache.clear();
    this.updateStats();
  }

  // Clear cache entries by prefix
  clearByPrefix(prefix: string): number {
    let deletedCount = 0;
    
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.updateStats();
    }
    
    return deletedCount;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Check if cache entry is expired
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Update cache statistics
  private updateStats(): void {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
  }

  // Calculate memory usage
  private calculateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, value] of this.memoryCache) {
      size += key.length;
      size += JSON.stringify(value).length;
    }
    
    return size;
  }

  // Update hit rate
  private updateHitRate(hit: boolean): void {
    // Simple moving average for hit rate
    const alpha = 0.1;
    this.stats.hitRate = this.stats.hitRate * (1 - alpha) + (hit ? 1 : 0) * alpha;
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean every minute
  }

  // Cleanup expired entries
  private cleanup(): void {
    let deletedCount = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.updateStats();
    }
    
    this.stats.lastCleanup = Date.now();
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Utility functions for local storage cache
export function getLocalCache<T>(key: string): Record<string, CacheEntry<T>> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

export function setLocalCache<T>(key: string, data: Record<string, CacheEntry<T>>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silent error handling
  }
}

export function clearLocalCache(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch {
    // Silent error handling
  }
} 