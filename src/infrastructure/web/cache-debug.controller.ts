import { Controller, Get, Param, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@ApiTags('debug')
@Controller('debug/cache')
export class CacheDebugController {
  private readonly logger = new Logger(CacheDebugController.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  @Get('keys/:pattern')
  @ApiOperation({ summary: 'List cache keys by pattern (for debugging)' })
  @ApiParam({ name: 'pattern', example: 'user:*' })
  async listKeys(@Param('pattern') pattern: string) {
    this.logger.log(`🔍 Searching for keys matching pattern: "${pattern}"`);

    // Note: This is a basic implementation
    // For production, you might need to use Redis SCAN command
    return {
      message: 'This endpoint requires direct Redis client access',
      note: 'Use redis-cli KEYS command to list keys',
      pattern,
    };
  }

  @Get('test/:key')
  @ApiOperation({ summary: 'Test cache get for specific key' })
  @ApiParam({ name: 'key', example: 'user:1234' })
  async testGet(@Param('key') key: string) {
    this.logger.log(`🔍 Testing cache GET for key: "${key}"`);

    const value = await this.cacheManager.get(key);

    this.logger.log(`💾 Result: ${value ? 'FOUND' : 'NOT FOUND'}`);
    if (value) {
      this.logger.log(`📦 Value: ${JSON.stringify(value)}`);
    }

    return {
      key,
      found: !!value,
      value: value || null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('set/:key/:value')
  @ApiOperation({ summary: 'Test cache set for specific key' })
  @ApiParam({ name: 'key', example: 'test:123' })
  @ApiParam({ name: 'value', example: 'hello' })
  async testSet(@Param('key') key: string, @Param('value') value: string) {
    this.logger.log(`💾 Testing cache SET for key: "${key}", value: "${value}"`);

    await this.cacheManager.set(key, value, 300); // 5 minutes TTL

    // Verify
    const verification = await this.cacheManager.get(key);
    const success = verification === value;

    this.logger.log(`✅ Verification: ${success ? 'SUCCESS' : 'FAILED'}`);

    return {
      key,
      value,
      stored: success,
      verification,
      ttl: 300,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a cache key' })
  @ApiParam({ name: 'key', example: 'user:1234' })
  async deleteKey(@Param('key') key: string) {
    this.logger.log(`🗑️  Deleting cache key: "${key}"`);

    const before = await this.cacheManager.get(key);
    await this.cacheManager.del(key);
    const after = await this.cacheManager.get(key);

    return {
      key,
      existedBefore: !!before,
      existsAfter: !!after,
      deleted: !!before && !after,
      timestamp: new Date().toISOString(),
    };
  }
}
