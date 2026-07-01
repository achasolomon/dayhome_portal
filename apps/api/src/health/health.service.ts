import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly redisService: RedisService,
  ) {}

  async check() {
    let postgres = 'up';
    let redis = 'up';

    try {
      await this.sequelize.authenticate();
    } catch {
      postgres = 'down';
    }

    try {
      await this.redisService.set('health', 'ok', 10);
    } catch {
      redis = 'down';
    }

    return {
      status: postgres === 'up' && redis === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        postgres,
        redis,
      },
    };
  }
}
