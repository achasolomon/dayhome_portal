import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { StaffRepository } from './staff.repository';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { StaffQueryDto } from './dto/staff-query.dto';
import { CheckInvitationDto } from './dto/check-invitation.dto';
import { STAFF_ROLES } from './dto/invite-staff.dto';
import { QueuesService } from '../../queues/queues.service';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { Invitation, User } from '../staff/entities/staff.entity';

@Injectable()
export class StaffService implements OnModuleInit {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    private readonly repository: StaffRepository,
    private readonly queuesService: QueuesService,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  onModuleInit() {
    void this.markExpiredInvitations();
    setInterval(
      () => {
        void this.markExpiredInvitations();
      },
      60 * 60 * 1000,
    );
  }

  async markExpiredInvitations() {
    try {
      const count = await this.repository.markExpiredInvitations();
      if (count > 0) this.logger.log(`Marked ${count} expired invitations`);
    } catch {
      this.logger.error('Failed to mark expired invitations');
    }
  }

  getRoles() {
    const labelMap: Record<string, string> = {
      ORG_ADMIN: 'Admin',
      ORG_MANAGER: 'Manager',
      BILLING_ONLY: 'Billing Only',
    };
    return STAFF_ROLES.map((value) => ({
      value,
      label: labelMap[value] || value.replace(/_/g, ' '),
    }));
  }

  async invite(dto: InviteStaffDto, organizationId: string) {
    const existing = await this.repository.findPendingInvitationByEmail(
      dto.email,
      organizationId,
    );
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.INVITATION_PENDING,
        message: 'A pending invitation already exists for this email.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.repository.createInvitation({
      email: dto.email,
      role: dto.role,
      organizationId,
      token,
      expiresAt,
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      phone: dto.phone ?? '',
    } as CreationAttributes<Invitation>);

    await this.queuesService.queueInviteEmail({
      email: dto.email,
      token,
      organizationId,
    });

    return invitation;
  }

  async listStaff(organizationId: string, query: StaffQueryDto) {
    const staff = await this.repository.findStaffByOrganization({
      organizationId,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    const pendingInvitations =
      await this.repository.findPendingInvitationsByOrganization(
        organizationId,
      );

    return {
      staff: staff.data,
      pagination: staff.pagination,
      pendingInvitations,
    };
  }

  async cancelInvitation(id: string, organizationId: string): Promise<void> {
    const invitation = await this.repository.findInvitationById(id);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundException({
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: 'Invitation not found.',
      });
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException({
        code: ERROR_CODES.INVITATION_NOT_PENDING,
        message: `Cannot cancel an invitation that is ${invitation.status.toLowerCase()}.`,
      });
    }
    await this.repository.markInvitationCancelled(id);
  }

  async resendInvitation(id: string, organizationId: string) {
    const invitation = await this.repository.findInvitationById(id);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundException({
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: 'Invitation not found.',
      });
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException({
        code: ERROR_CODES.INVITATION_NOT_PENDING,
        message: `Cannot resend an invitation that is ${invitation.status.toLowerCase()}.`,
      });
    }
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException({
        code: ERROR_CODES.INVITATION_EXPIRED,
        message: 'Invitation has expired. Please send a new invitation.',
      });
    }

    await this.queuesService.queueInviteEmail({
      email: invitation.email,
      token: invitation.token,
      organizationId: invitation.organizationId,
    });

    return invitation;
  }

  async checkInvitation(token: string): Promise<CheckInvitationDto> {
    const invitation = await this.repository.findInvitationByToken(token);
    if (!invitation) {
      return { valid: false, message: 'Invitation not found.' };
    }
    if (invitation.status !== 'PENDING') {
      return {
        valid: false,
        message: `Invitation is already ${invitation.status.toLowerCase()}.`,
      };
    }
    if (new Date() > invitation.expiresAt) {
      return { valid: false, message: 'Invitation has expired.' };
    }
    return {
      valid: true,
      email: invitation.email,
      role: invitation.role,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      phone: invitation.phone,
    };
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<void> {
    const invitation = await this.repository.findInvitationByToken(dto.token);
    if (!invitation) {
      throw new NotFoundException({
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: 'Invitation not found or has been revoked.',
      });
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException({
        code: ERROR_CODES.INVITATION_NOT_PENDING,
        message: `Invitation is already ${invitation.status.toLowerCase()}.`,
      });
    }
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException({
        code: ERROR_CODES.INVITATION_EXPIRED,
        message: 'Invitation has expired. Please request a new one.',
      });
    }

    const existingUser = await this.userModel.findOne({
      where: { email: invitation.email },
    });
    if (existingUser) {
      throw new ConflictException({
        code: ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        message: 'A user with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userModel.create({
      email: invitation.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: invitation.role,
      organizationId: invitation.organizationId,
    } as CreationAttributes<User>);

    await this.repository.markInvitationAccepted(invitation.id);
  }
}
