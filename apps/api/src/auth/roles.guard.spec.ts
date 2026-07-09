import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  function mockContext(userRole?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: userRole } }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext('ORG_ADMIN'));

    expect(result).toBe(true);
  });

  it('should allow access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ORG_ADMIN', 'SUPER_ADMIN']);

    const result = guard.canActivate(mockContext('ORG_ADMIN'));

    expect(result).toBe(true);
  });

  it('should deny access when user does not have a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['SUPER_ADMIN']);

    const result = guard.canActivate(mockContext('ORG_ADMIN'));

    expect(result).toBe(false);
  });

  it('should deny access when user has no role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ORG_ADMIN']);

    const result = guard.canActivate(mockContext(undefined));

    expect(result).toBe(false);
  });

  it('should read metadata from both handler and class', () => {
    guard.canActivate(mockContext('ORG_ADMIN'));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
  });
});
