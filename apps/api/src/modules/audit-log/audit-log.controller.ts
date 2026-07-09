import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { AuditLogAccessGuard } from './guards/audit-log-access.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';

@ApiTags('Audit Logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, AuditLogAccessGuard)
@Controller({ path: 'audit-logs', version: '1' })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'List audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Paginated audit log list' })
  async findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.findAll(query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log found' })
  async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
    const log = await this.auditLogService.findById(id);
    return AuditLogResponseDto.from(log);
  }
}
