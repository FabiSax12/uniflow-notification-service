import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  services: {
    redis: {
      status: string;
      message?: string;
    };
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  async check(): Promise<HealthCheckResponse> {
    const redisStatus = await this.checkRedis();

    return {
      status: redisStatus.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisStatus,
      },
    };
  }

  private async checkRedis(): Promise<{
    status: string;
    message?: string;
  }> {
    try {
      const testKey = 'health_check_test';
      const testValue = 'test';

      // Try to set and get a value
      await this.cacheManager.set(testKey, testValue, 10);
      const value = await this.cacheManager.get(testKey);

      if (value === testValue) {
        await this.cacheManager.del(testKey);
        return { status: 'healthy' };
      }

      return {
        status: 'unhealthy',
        message: 'Redis test value mismatch',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
