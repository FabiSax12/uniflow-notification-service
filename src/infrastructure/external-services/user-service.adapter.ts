import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UserServicePort } from 'src/application/ports/user-service.port';
import { User } from 'src/domain/entities/user';
import { Email } from 'src/domain/value-objects/email';
import { UserId } from 'src/domain/value-objects/user-id';

interface StudentApiResponse {
  id: string;
  email: string;
  name: string;
  deviceTokens?: string[];
}

@Injectable()
export class UserServiceAdapter implements UserServicePort {
  private readonly logger = new Logger(UserServiceAdapter.name);
  private readonly userServiceUrl: string;
  private readonly cacheKeyPrefix = 'user:';
  private readonly cacheTTL: number;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.userServiceUrl =
      process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3001';
    this.cacheTTL = parseInt(process.env.USER_CACHE_TTL || '3600', 10); // 1 hour default

    this.logger.log(`🚀 UserServiceAdapter initialized`);
    this.logger.log(`📍 User Service URL: ${this.userServiceUrl}`);
    this.logger.log(`🔑 Cache Key Prefix: "${this.cacheKeyPrefix}"`);
    this.logger.log(`⏱️  Cache TTL: ${this.cacheTTL}s`);
    this.logger.log(`💾 Cache Manager Type: ${this.cacheManager.constructor.name}`);
  }

  async getUserById(userId: UserId): Promise<User> {
    const cacheKey = `${this.cacheKeyPrefix}${userId.getValue()}`;

    this.logger.debug(`🔍 Attempting to get user with ID: ${userId.getValue()}`);
    this.logger.debug(`🔑 Cache key being used: "${cacheKey}"`);
    this.logger.debug(`⏱️  Cache TTL configured: ${this.cacheTTL}s`);

    try {
      // Try to get from cache first
      const cachedUser =
        await this.cacheManager.get<StudentApiResponse>(cacheKey);

      this.logger.debug(
        `💾 Cache lookup result: ${cachedUser ? 'FOUND' : 'NOT FOUND'}`,
      );

      if (cachedUser) {
        this.logger.debug(
          `✅ Cache HIT for user ${userId.getValue()} - Data: ${JSON.stringify(cachedUser)}`,
        );
        return this.mapApiResponseToUser(cachedUser);
      }

      this.logger.warn(
        `❌ Cache MISS for user ${userId.getValue()} - Fetching from API: ${this.userServiceUrl}/students/google/${userId.getValue()}`,
      );

      // Fetch from users microservice
      const response = await fetch(
        `${this.userServiceUrl}/students/google/${userId.getValue()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user from microservice: ${response.status} ${response.statusText}`,
        );
      }

      const userData = (await response.json()) as StudentApiResponse;

      this.logger.debug(`📥 Received data from API: ${JSON.stringify(userData)}`);

      // Store in cache
      this.logger.debug(
        `💾 Storing in cache with key: "${cacheKey}", TTL: ${this.cacheTTL}s`,
      );
      await this.cacheManager.set(cacheKey, userData, this.cacheTTL * 1000);

      // Verify cache was stored
      const verification = await this.cacheManager.get(cacheKey);
      this.logger.debug(
        `✅ Cache verification: ${verification ? 'STORED SUCCESSFULLY' : '⚠️  STORAGE FAILED'}`,
      );
      this.logger.debug(`🔑 Cached Data: ${JSON.stringify(verification)}`);

      return this.mapApiResponseToUser(userData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error fetching user ${userId.getValue()}: ${errorMessage}`,
        errorStack,
      );

      // Return a fallback user or re-throw based on your requirements
      throw new Error(`Unable to retrieve user: ${errorMessage}`);
    }
  }

  private mapApiResponseToUser(userData: StudentApiResponse): User {
    return User.create({
      id: new UserId(userData.id),
      email: new Email(userData.email),
      name: userData.name,
      deviceTokens: userData.deviceTokens || [],
    });
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUserCache(userId: UserId): Promise<void> {
    const cacheKey = `${this.cacheKeyPrefix}${userId.getValue()}`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Invalidated cache for user ${userId.getValue()}`);
  }
}
