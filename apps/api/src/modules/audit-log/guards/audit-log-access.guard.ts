import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuditLogAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { organizationId?: string; role?: string };
    }>();

    const user = request.user;
    if (!user) return false;

    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') return true;

    return user.organizationId != null;
  }
}
