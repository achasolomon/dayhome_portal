import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesApiResponse, RoleWithPermissions } from './dto/role-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles as RolesDecorator } from '../../auth/roles.decorator';

@ApiTags('Roles')
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('ORG_ADMIN', 'ORG_MANAGER')
  @ApiOperation({ summary: 'Get all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Role-permission matrix' })
  async getRolePermissions(): Promise<RolesApiResponse> {
    return this.rolesService.getRolePermissions();
  }

  @Patch('permissions/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('ORG_ADMIN')
  @ApiOperation({ summary: 'Update permissions for a role' })
  @ApiResponse({ status: 200, description: 'Permissions updated' })
  async updateRolePermissions(
    @Param('role') role: string,
    @Body() dto: UpdatePermissionsDto,
  ): Promise<RoleWithPermissions> {
    return this.rolesService.updateRolePermissions(role, dto.permissions);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('ORG_ADMIN')
  @ApiOperation({ summary: 'Create a new custom role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async createRole(@Body() dto: CreateRoleDto): Promise<RoleWithPermissions> {
    return this.rolesService.createRole(dto.role, dto.label);
  }

  @Delete(':role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator('ORG_ADMIN')
  @ApiOperation({ summary: 'Delete a custom role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async deleteRole(@Param('role') role: string): Promise<void> {
    return this.rolesService.deleteRole(role);
  }
}
