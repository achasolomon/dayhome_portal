import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';
import { OrganizationAccessGuard } from './guards/organization-access.guard';

// NOTE: Single-tenant mode — only GET :id + PATCH :id are exposed.
// Multi-tenant endpoints (POST, GET list, DELETE) preserved in code
// for future upscale — uncomment when multi-tenancy is needed.

@ApiTags('Organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // @Post()
  // @Roles('SUPER_ADMIN')
  // @ApiOperation({ summary: 'Create a new organization' })
  // @ApiResponse({ status: 201, description: 'Organization created' })
  // async create(
  //   @Body() dto: CreateOrganizationDto,
  // ): Promise<OrganizationResponseDto> {
  //   const org = await this.organizationService.create(dto);
  //   return OrganizationResponseDto.from(org);
  // }

  // @Get()
  // @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  // @ApiOperation({ summary: 'List all organizations' })
  // @ApiResponse({ status: 200, description: 'Paginated list' })
  // async findAll(@Query() query: OrganizationQueryDto) {
  //   return this.organizationService.findAll(query);
  // }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @UseGuards(OrganizationAccessGuard)
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
    const org = await this.organizationService.findById(id);
    return OrganizationResponseDto.from(org);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @Permissions('settings.update')
  @UseGuards(OrganizationAccessGuard)
  @AuditLog({ action: 'organization.update', entity: 'Organization' })
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationService.update(id, dto);
    return OrganizationResponseDto.from(org);
  }

  // @Delete(':id')
  // @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  // @UseGuards(OrganizationAccessGuard)
  // @ApiOperation({ summary: 'Soft-delete an organization' })
  // @ApiResponse({ status: 200, description: 'Organization deleted' })
  // async remove(@Param('id') id: string): Promise<{ message: string }> {
  //   await this.organizationService.remove(id);
  //   return { message: 'Organization deleted successfully' };
  // }
}
