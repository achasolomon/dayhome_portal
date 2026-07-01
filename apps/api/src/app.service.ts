import { Injectable } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(): Promise<string> {
    await this.redisService.set('sprint0', 'redis-working');

    const value = await this.redisService.get('sprint0');

    return `Redis says: ${value}`;
  }
}
