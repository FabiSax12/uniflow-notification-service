import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10), // Redis database number
      ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour default
      max: parseInt(process.env.REDIS_MAX_ITEMS || '100', 10),
      password: process.env.REDIS_PASSWORD,
    }),
  ],
  providers: [RedisCacheService],
  exports: [CacheModule, RedisCacheService],
})
export class RedisCacheModule implements OnModuleInit {
  private readonly logger = new Logger(RedisCacheModule.name);

  onModuleInit() {
    this.logger.log('🚀 Redis Cache Module initialized');
    this.logger.log(`📍 Redis Host: ${process.env.REDIS_HOST || 'localhost'}`);
    this.logger.log(`🔌 Redis Port: ${process.env.REDIS_PORT || '6379'}`);
    this.logger.log(`🗄️  Redis DB: ${process.env.REDIS_DB || '0'}`);
    this.logger.log(`⏱️  Redis TTL: ${process.env.REDIS_TTL || '3600'}s`);
    this.logger.log(`📦 Redis Max Items: ${process.env.REDIS_MAX_ITEMS || '100'}`);
    this.logger.log(`🔐 Redis Password: ${process.env.REDIS_PASSWORD ? '***SET***' : 'NOT SET'}`);
  }
}
