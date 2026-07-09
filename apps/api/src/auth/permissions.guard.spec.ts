import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  function mockContext(userPermissions?: string[]): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { permissions: userPermissions } }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new PermissionsGuard(reflector);
  });

  it('should allow access when no permissions are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext([]));

    expect(result).toBe(true);
  });

  it('should allow access when user has all required permissions', () => {
    reflector.getAllAndOverride.mockReturnValue(['staff.invite', 'staff.list']);

    const result = guard.canActivate(
      mockContext(['staff.invite', 'staff.list', 'settings.view']),
    );

    expect(result).toBe(true);
  });

  it('should deny access when user lacks a required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'staff.invite',
      'staff.remove',
    ]);

    const result = guard.canActivate(mockContext(['staff.invite']));

    expect(result).toBe(false);
  });

  it('should deny access when user has no permissions', () => {
    reflector.getAllAndOverride.mockReturnValue(['staff.invite']);

    const result = guard.canActivate(mockContext(undefined));

    expect(result).toBe(false);
  });

  it('should deny access when user has empty permissions array', () => {
    reflector.getAllAndOverride.mockReturnValue(['staff.invite']);

    const result = guard.canActivate(mockContext([]));

    expect(result).toBe(false);
  });

  it('should read metadata from both handler and class', () => {
    guard.canActivate(mockContext([]));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
  });
});
