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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Staff')
@Controller({ path: 'staff', version: '1' })
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Invite a staff member to an organization' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  async invite(
    @Body() dto: InviteStaffDto,
    @CurrentUser('organizationId') organizationId: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.staffService.invite(dto, organizationId);
    return InvitationResponseDto.from(invitation);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORG_ADMIN', 'ORG_MANAGER')
  @ApiOperation({ summary: 'List staff members for the current organization' })
  @ApiResponse({ status: 200, description: 'Staff list' })
  async listStaff(
    @Query() query: StaffQueryDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.staffService.listStaff(organizationId, query);
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
  @ApiOperation({ summary: 'Accept an invitation and create user account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
  ): Promise<{ message: string }> {
    await this.staffService.acceptInvite(dto);
    return { message: 'Account created successfully. You can now log in.' };
  }
}
