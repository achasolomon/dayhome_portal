import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

type RequestWithId = Request & { id?: string };

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const KEY_PREFIX = 'login_attempts:';

@Injectable()
export class LoginThrottleGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const ip = request.ip || 'unknown';
    const key = `${KEY_PREFIX}${ip}`;

    const attempts = await this.redisService.get(key);
    const count = attempts ? Number(attempts) : 0;

    if (count >= MAX_ATTEMPTS) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'AUTH_TOO_MANY_ATTEMPTS',
            message: `Too many login attempts. Please try again in ${WINDOW_SECONDS / 60} minutes.`,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  async recordFailure(ip: string): Promise<void> {
    const key = `${KEY_PREFIX}${ip}`;
    const ttl = await this.redisService.ttl(key);
    if (ttl === -2) {
      await this.redisService.set(key, '1', WINDOW_SECONDS);
    } else {
      await this.redisService.increment(key);
      if (ttl === -1) {
        await this.redisService.expire(key, WINDOW_SECONDS);
      }
    }
  }

  async clearAttempts(ip: string): Promise<void> {
    const key = `${KEY_PREFIX}${ip}`;
    await this.redisService.del(key);
  }
}
