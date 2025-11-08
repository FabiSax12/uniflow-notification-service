import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Redis Cache Service
 * Provides a type-safe wrapper around the cache manager
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(
        `Error getting cache key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return undefined;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Set cache key: ${key} with TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(
        `Error setting cache key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting cache key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys Array of cache keys
   */
  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.del(key)));
  }

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @returns true if key exists, false otherwise
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.cacheManager.get(key);
      return value !== undefined;
    } catch (error) {
      this.logger.error(
        `Error checking cache key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Get or set a value in cache using a factory function
   * @param key Cache key
   * @param factory Function to generate value if not in cache
   * @param ttl Time to live in seconds (optional)
   * @returns Cached or newly generated value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) {
      this.logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss for key: ${key}, generating value`);
    const value = await factory();
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Wrap a function with caching
   * @param keyPrefix Prefix for cache key
   * @param fn Function to wrap
   * @param ttl Time to live in seconds (optional)
   * @returns Wrapped function
   */
  wrap<TArgs extends any[], TResult>(
    keyPrefix: string,
    fn: (...args: TArgs) => Promise<TResult>,
    ttl?: number,
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }
}
