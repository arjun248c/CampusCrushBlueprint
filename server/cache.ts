// Simple in-memory cache implementation
class SimpleCache {
  private cache = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, ttl: number = 5 * 60 * 1000): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
  }

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  colleges: () => 'colleges:all',
  leaderboard: (collegeId: string, period: string) => `leaderboard:${collegeId}:${period}`,
};

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);