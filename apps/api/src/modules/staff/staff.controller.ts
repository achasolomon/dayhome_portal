import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { StaffQueryDto } from './dto/staff-query.dto';
import { InvitationResponseDto } from './dto/staff-response.dto';
import { CheckInvitationDto } from './dto/check-invitation.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { StaffAccessGuard } from './guards/staff-access.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Staff')
@Controller({ path: 'staff', version: '1' })
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, StaffAccessGuard)
  @Roles('ORG_ADMIN')
  @Permissions('staff.invite')
  @AuditLog({ action: 'staff.invite', entity: 'Invitation' })
  @ApiOperation({ summary: 'Invite a staff member to an organization' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  async invite(
    @Body() dto: InviteStaffDto,
    @CurrentUser('organizationId') organizationId: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.staffService.invite(dto, organizationId);
    return InvitationResponseDto.from(invitation);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, StaffAccessGuard)
  @Roles('ORG_ADMIN', 'ORG_MANAGER')
  @Permissions('staff.list')
  @ApiOperation({ summary: 'Get available staff roles' })
  @ApiResponse({ status: 200, description: 'Staff roles' })
  getRoles() {
    return this.staffService.getRoles();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, StaffAccessGuard)
  @Roles('ORG_ADMIN', 'ORG_MANAGER')
  @Permissions('staff.list')
  @ApiOperation({ summary: 'List staff members for the current organization' })
  @ApiResponse({ status: 200, description: 'Staff list' })
  async listStaff(
    @Query() query: StaffQueryDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.staffService.listStaff(organizationId, query);
  }

  @Post('invitations/:id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, StaffAccessGuard)
  @Roles('ORG_ADMIN')
  @Permissions('staff.invite')
  @AuditLog({ action: 'staff.resend', entity: 'Invitation' })
  @ApiOperation({ summary: 'Resend a pending invitation email' })
  @ApiResponse({ status: 200, description: 'Invitation resent' })
  async resendInvitation(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.staffService.resendInvitation(
      id,
      organizationId,
    );
    return InvitationResponseDto.from(invitation);
  }

  @Post('invitations/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, StaffAccessGuard)
  @Roles('ORG_ADMIN')
  @Permissions('staff.remove')
  @AuditLog({ action: 'staff.cancel', entity: 'Invitation' })
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled' })
  async cancelInvitation(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ): Promise<{ message: string }> {
    await this.staffService.cancelInvitation(id, organizationId);
    return { message: 'Invitation cancelled successfully.' };
  }

  @Get('invitation/:token')
  @ApiOperation({ summary: 'Validate an invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation info returned' })
  async checkInvitation(
    @Param('token') token: string,
  ): Promise<CheckInvitationDto> {
    return this.staffService.checkInvitation(token);
  }

  @Post('accept-invite')
  @AuditLog({ action: 'staff.accept', entity: 'Invitation' })
  @ApiOperation({ summary: 'Accept an invitation and create user account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
  ): Promise<{ message: string }> {
    await this.staffService.acceptInvite(dto);
    return { message: 'Account created successfully. You can now log in.' };
  }
}
