/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  VersioningType,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../src/auth/auth.service';
import { AuthController } from '../src/auth/auth.controller';
import { UsersService } from '../src/users/users.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { Request } from 'express';

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: unknown }>();
    req.user = {
      id: 'u1',
      email: 'a@b.com',
      role: 'ORG_ADMIN',
      firstName: 'Test',
      lastName: 'User',
      permissions: [],
      organizationId: null,
      dayhomeId: null,
      refreshToken: 'rt',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return true;
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            findById: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    authService = moduleFixture.get(AuthService);
    usersService = moduleFixture.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 201 with access token on successful login', async () => {
      const mockUser = { id: 'u1', email: 'a@b.com', role: 'ORG_ADMIN' };
      authService.validateUser.mockResolvedValue(mockUser as never);
      authService.login.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: mockUser as never,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'a@b.com', password: 'ValidPass1!' })
        .expect(201);

      expect(res.body.accessToken).toBe('access-token-123');
      expect(res.body.user).toBeDefined();
    });

    it('should return 401 with invalid credentials', async () => {
      authService.validateUser.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'a@b.com', password: 'wrongpass' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 400 with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'ValidPass1!' })
        .expect(400);
    });

    it('should return 400 with password too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'a@b.com', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 with created user', async () => {
      const createdUser = {
        id: 'u2',
        email: 'new@b.com',
        role: 'ORG_ADMIN',
        firstName: null,
        lastName: null,
        permissions: [],
        organizationId: null,
        dayhomeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      usersService.create.mockResolvedValue(createdUser as never);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'new@b.com', password: 'ValidPass1!' })
        .expect(201);

      expect(res.body.email).toBe('new@b.com');
    });

    it('should return 400 with missing email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ password: 'ValidPass1!' })
        .expect(400);
    });

    it('should return 400 with missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'new@b.com' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 201 with new tokens', async () => {
      const mockUser = { id: 'u1', email: 'a@b.com', role: 'ORG_ADMIN' };
      authService.refresh.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser as never,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=valid-refresh-token'])
        .expect(201);

      expect(res.body.accessToken).toBe('new-access-token');
    });

    it('should return 401 without refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(res.body.message).toBe('No refresh token provided');
    });

    it('should return 401 when refresh token is invalid', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=expired-token'])
        .expect(401);

      expect(res.body.message).toBe('Invalid or expired refresh token');
    });

    it('should return 401 when refresh token has wrong signature', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token signature'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=tampered-token'])
        .expect(401);
    });

    it('should return 401 when refresh token refers to deleted user', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=deleted-user-token'])
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 201 when authenticated', async () => {
      authService.logout.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should still return 201 when logout service fails', async () => {
      authService.logout.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(201);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 200 when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.email).toBe('a@b.com');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 201 when email is provided', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'ok' });

      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'user@example.com',
      );
    });

    it('should return 400 with missing email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({})
        .expect(400);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should return 201 when token and password are valid', async () => {
      authService.resetPassword.mockResolvedValue({ message: 'ok' });

      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'valid-token', password: 'NewPass123!' })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'valid-token',
        'NewPass123!',
      );
    });

    it('should return 401 with invalid token', async () => {
      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Invalid or expired reset token'),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPass123!' })
        .expect(401);

      expect(res.body.message).toBe('Invalid or expired reset token');
    });

    it('should return 401 with expired token', async () => {
      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Reset token has expired'),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'expired-token', password: 'NewPass123!' })
        .expect(401);

      expect(res.body.message).toBe('Reset token has expired');
    });

    it('should return 400 with missing token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ password: 'NewPass123!' })
        .expect(400);
    });

    it('should return 400 with missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'some-token' })
        .expect(400);
    });

    it('should return 400 with password too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'some-token', password: '12345' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should return 201 with valid old and new password', async () => {
      authService.changePassword.mockResolvedValue({
        message: 'Password changed',
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ oldPassword: 'OldPass1!', newPassword: 'NewPass1!' })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.changePassword).toHaveBeenCalledWith(
        'u1',
        'OldPass1!',
        'NewPass1!',
      );
    });

    it('should return 401 with wrong old password', async () => {
      authService.changePassword.mockRejectedValue(
        new UnauthorizedException('Current password is incorrect'),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ oldPassword: 'WrongPass1!', newPassword: 'NewPass1!' })
        .expect(401);

      expect(res.body.message).toBe('Current password is incorrect');
    });
  });

  describe('Token expiry and refresh cycle', () => {
    it('should handle token refresh after access token expires', async () => {
      const mockUser = { id: 'u1', email: 'a@b.com', role: 'ORG_ADMIN' };

      // First refresh succeeds
      authService.refresh.mockResolvedValueOnce({
        accessToken: 'refreshed-token',
        refreshToken: 'new-refresh-token',
        user: mockUser as never,
      });

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=still-valid-token'])
        .expect(201);

      expect(refreshRes.body.accessToken).toBe('refreshed-token');

      // Then refresh fails because refresh token also expired
      authService.refresh.mockRejectedValueOnce(
        new UnauthorizedException('Refresh token expired'),
      );

      const expiredRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refresh_token=expired-refresh-token'])
        .expect(401);

      expect(expiredRes.body.message).toBe('Refresh token expired');
    });
  });

  describe('Rate limiting / brute force protection', () => {
    it('should reject login attempts with invalid credentials', async () => {
      authService.validateUser.mockResolvedValue(null);

      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: 'a@b.com', password: 'wrongpass' })
          .expect(401);
      }
    });

    it('should accept valid credentials after previous failures', async () => {
      const mockUser = { id: 'u1', email: 'a@b.com', role: 'ORG_ADMIN' };
      authService.validateUser.mockResolvedValue(mockUser as never);
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser as never,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'a@b.com', password: 'CorrectPass1!' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
    });
  });
});
