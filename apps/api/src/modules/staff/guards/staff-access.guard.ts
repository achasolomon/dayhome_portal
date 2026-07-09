import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { Invitation } from '../entities/staff.entity';

@Injectable()
export class StaffAccessGuard implements CanActivate {
  constructor(
    @InjectModel(Invitation)
    private readonly invitationModel: typeof Invitation,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { organizationId?: string; role?: string };
      params: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) return false;

    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') return true;

    const invitationId = request.params.id;
    if (!invitationId) {
      return user.organizationId != null;
    }

    const invitation = await this.invitationModel.findByPk(invitationId, {
      paranoid: false,
    });
    if (!invitation) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN_STAFF,
        message: 'You do not have access to this staff resource.',
      });
    }

    if (invitation.organizationId !== user.organizationId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN_STAFF,
        message: 'You do not have access to this staff resource.',
      });
    }

    return true;
  }
}
