import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { SettingsAccessGuard } from './guards/settings-access.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, SettingsAccessGuard)
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER')
  @Permissions('settings.view')
  @ApiOperation({ summary: 'Get organization settings' })
  @ApiResponse({ status: 200, description: 'Settings found' })
  async get(
    @CurrentUser() user: { organizationId?: string; role?: string },
  ): Promise<SettingsResponseDto> {
    const orgId = this.resolveOrgId(user);
    const settings = await this.settingsService.getByOrganizationId(orgId);
    return SettingsResponseDto.from(settings);
  }

  @Patch()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @Permissions('settings.update')
  @AuditLog({ action: 'settings.update', entity: 'OrganizationSettings' })
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async update(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: { organizationId?: string; role?: string },
  ): Promise<SettingsResponseDto> {
    const orgId = this.resolveOrgId(user);
    const settings = await this.settingsService.upsert(orgId, dto);
    return SettingsResponseDto.from(settings);
  }

  private resolveOrgId(user: {
    organizationId?: string;
    role?: string;
  }): string {
    if (!user.organizationId) {
      throw new Error('Organization ID is required');
    }
    return user.organizationId;
  }
}
