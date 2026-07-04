import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.model';
import { UserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) return null;
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  async login(user: User): Promise<LoginResult> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const refreshTokenId = crypto.randomUUID();

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, tokenId: refreshTokenId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as jwt.SignOptions['expiresIn'],
      },
    );

    await user.update({ refreshToken: refreshTokenId });

    const safeUser = UserDto.fromModel(user);
    return { accessToken, refreshToken, user: safeUser };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<Record<string, unknown>>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const sub = payload.sub as string | undefined;
      const tokenId = payload.tokenId as string | undefined;

      if (!sub || !tokenId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(sub);
      if (!user || user.refreshToken !== tokenId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      await user.update({ refreshToken: '' });
    }
  }
}
