import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { OrganizationAccessGuard } from './guards/organization-access.guard';

@ApiTags('Organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  async create(
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationService.create(dto);
    return OrganizationResponseDto.from(org);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'List all organizations' })
  @ApiResponse({ status: 200, description: 'Paginated list' })
  async findAll(@Query() query: OrganizationQueryDto) {
    return this.organizationService.findAll(query);
  }

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
  @UseGuards(OrganizationAccessGuard)
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationService.update(id, dto);
    return OrganizationResponseDto.from(org);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @UseGuards(OrganizationAccessGuard)
  @ApiOperation({ summary: 'Soft-delete an organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.organizationService.remove(id);
    return { message: 'Organization deleted successfully' };
  }
}
