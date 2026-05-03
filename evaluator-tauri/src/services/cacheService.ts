/**
 * Optimized Cache Service for Tauri/React.
 * Replaces the Python file-based cache with localStorage.
 */

const CACHE_PREFIX = "scholar_ms_cache_";

interface CacheMeta {
  fetchedAt: number;
  ttlSeconds: number;
}

interface CacheEntry<T> {
  data: T;
  meta: CacheMeta;
}

export const CacheService = {
  /**
   * Retrieves data from localStorage.
   */
  get<T>(key: string): T | null {
    try {
      const entry = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!entry) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(entry);
      return cacheEntry.data;
    } catch (e) {
      console.error(`Cache read error for ${key}:`, e);
      return null;
    }
  },

  /**
   * Saves data to localStorage (persistent, no TTL).
   */
  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        meta: {
          fetchedAt: Date.now(),
          ttlSeconds: 0,
        },
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (e) {
      console.error(`Cache write error for ${key}:`, e);
    }
  },

  /**
   * Merges list data efficiently.
   */
  mergeData<T>(key: string, newItems: T[], idField: keyof T = 'id' as keyof T): T[] {
    const existing: T[] = this.get<T[]>(key) || [];
    
    const itemsMap = new Map(existing.map(item => [String(item[idField]), item]));
    
    for (const item of newItems) {
      itemsMap.set(String(item[idField]), item);
    }

    const merged = Array.from(itemsMap.values());
    this.set(key, merged);
    return merged;
  },

  /**
   * Gets latest updated_at from a list cache.
   */
  getLatestUpdatedAt(key: string): string | null {
    const data = this.get<any[]>(key);
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.reduce((latest, item) => {
      const ua = item.updated_at;
      return (!latest || (ua && ua > latest)) ? ua : latest;
    }, null);
  },

  purge(key: string): void {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};
