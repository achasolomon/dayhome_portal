/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { QueuesService } from '../queues/queues.service';
import { User } from '../users/entities/user.model';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'ORG_ADMIN',
    firstName: 'Test',
    lastName: 'User',
    permissions: [],
    organizationId: 'org-1',
    dayhomeId: null,
    refreshToken: 'old-token-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: QueuesService,
          useValue: {
            queueInviteEmail: jest.fn(),
            queueResetPasswordEmail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    (configService.get as jest.Mock).mockImplementation(
      (key: string, defaultValue?: string): string | null => {
        const map: Record<string, string> = {
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
          JWT_SECRET: 'jwt-secret',
          JWT_EXPIRES_IN: '15m',
        };
        return map[key] ?? defaultValue ?? null;
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBe(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toBe(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate tokens and update refresh token', async () => {
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(mockUser);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUser.update).toHaveBeenCalledWith({
        refreshToken: expect.any(String),
      });
    });

    it('should include user role in tokens', async () => {
      const captured: Record<string, unknown>[] = [];
      jwtService.sign.mockImplementation((payload: unknown) => {
        captured.push(payload as Record<string, unknown>);
        return 'token';
      });

      await service.login(mockUser);

      expect(captured[0]?.role).toBe('ORG_ADMIN');
      expect(captured[0]?.email).toBe('test@example.com');
      expect(captured[0]?.sub).toBe('user-1');
    });
  });

  describe('refresh', () => {
    const validPayload = {
      sub: 'user-1',
      tokenId: 'valid-token-id',
      email: 'test@example.com',
      role: 'ORG_ADMIN',
    };

    it('should return new tokens when refresh token is valid', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid-token-id',
      } as User);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw when refresh token payload lacks sub', async () => {
      jwtService.verify.mockReturnValue({ tokenId: 'some-id' });

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when refresh token payload lacks tokenId', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when user is not found', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      usersService.findById.mockResolvedValue(null);

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when tokenId does not match stored value', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'different-token-id',
      } as User);

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token when user exists', async () => {
      const updateMock = jest.fn();
      usersService.findById.mockResolvedValue({
        ...mockUser,
        update: updateMock,
      } as unknown as User);

      await service.logout('user-1');

      expect(updateMock).toHaveBeenCalledWith({ refreshToken: '' });
    });

    it('should do nothing when user is not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.logout('nonexistent')).resolves.toBeUndefined();
    });
  });
});
