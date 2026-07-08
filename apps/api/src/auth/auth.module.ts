import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UsersModule } from '../users/users.module';
import { QueuesModule } from '../queues/queues.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { LoginThrottleGuard } from './guards/login-throttle.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    QueuesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? '',
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_EXPIRES_IN',
            '15m',
          ) as jwt.SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    LoginThrottleGuard,
  ],
  exports: [AuthService, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
