import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SettingsAccessGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { organizationId?: string; role?: string };
      params?: { id?: string };
    }>();
    const user = request.user;

    if (!user) return false;

    if (user.role === 'SUPER_ADMIN') return true;

    if (user.organizationId) return true;

    return false;
  }
}
