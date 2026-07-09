import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  constructor(
    @InjectModel(Organization)
    private readonly orgModel: typeof Organization,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { organizationId?: string; role?: string };
      params: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) return false;

    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') return true;

    const orgId = request.params.id;
    if (!orgId) return false;

    if (user.organizationId !== orgId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN_ORGANIZATION,
        message: 'You do not have access to this organization.',
      });
    }

    return true;
  }
}
