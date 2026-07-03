import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: (req: Request) => {
        const authHeader = req.headers?.authorization;
        if (
          typeof authHeader !== 'string' ||
          !authHeader.startsWith('Bearer ')
        ) {
          return null;
        }
        return authHeader.split(' ')[1] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
