import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RolesRepository } from './roles.repository';
import { DEFAULT_ROLE_PERMISSIONS } from './default-mappings';
import { PERMISSION_GROUPS } from './permissions';
import { RolesApiResponse, RoleWithPermissions } from './dto/role-response.dto';
import { User } from '../../users/entities/user.model';

const SYSTEM_ROLES: Record<string, string> = {
  ORG_ADMIN: 'Admin',
  ORG_MANAGER: 'Manager',
  BILLING_ONLY: 'Billing Only',
};

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly repository: RolesRepository,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedPermissions();
  }

  private async seedRoles() {
    const existing = await this.repository.getAllRoles();
    if (existing.length > 0) return;

    this.logger.log('Seeding default roles');
    for (const [role, label] of Object.entries(SYSTEM_ROLES)) {
      await this.repository.createRole(role, label);
      // mark as system in DB
      await this.repository
        .getRole(role)
        .then((r) => r?.update({ isSystem: true }));
    }
  }

  private async seedPermissions() {
    const existing = await this.repository.getAllMappings();
    if (existing.length > 0) return;

    this.logger.log('Seeding default role-permission mappings');
    for (const [role, permissions] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS,
    )) {
      await this.repository.setPermissionsForRole(role, permissions);
      await this.syncUserPermissions(role);
    }
  }

  async getRolePermissions(): Promise<RolesApiResponse> {
    const dbRoles = await this.repository.getAllRoles();
    const mappings = await this.repository.getAllMappings();
    const grouped = new Map<string, string[]>();

    for (const role of dbRoles) {
      grouped.set(role.role, []);
    }

    for (const m of mappings) {
      const arr = grouped.get(m.role);
      if (arr) arr.push(m.permission);
    }

    const roles: RoleWithPermissions[] = dbRoles.map((r) => ({
      role: r.role,
      label: SYSTEM_ROLES[r.role] || r.label,
      permissions: grouped.get(r.role) || [],
    }));

    return { roles, permissionGroups: PERMISSION_GROUPS };
  }

  private async syncUserPermissions(role: string): Promise<void> {
    const permissions = await this.repository.getPermissionsForRole(role);
    const permKeys = permissions.map((p) => p.permission);
    await this.userModel.update(
      { permissions: permKeys },
      {
        where: { role },
      },
    );
  }

  async updateRolePermissions(
    role: string,
    permissions: string[],
  ): Promise<RoleWithPermissions> {
    const dbRole = await this.repository.getRole(role);
    if (!dbRole) throw new NotFoundException(`Role "${role}" not found`);

    await this.repository.setPermissionsForRole(role, permissions);
    await this.syncUserPermissions(role);

    return {
      role,
      label: SYSTEM_ROLES[role] || dbRole.label,
      permissions,
    };
  }

  async createRole(role: string, label: string): Promise<RoleWithPermissions> {
    const existing = await this.repository.getRole(role);
    if (existing)
      throw new BadRequestException(`Role "${role}" already exists`);

    if (!/^[A-Z][A-Z0-9_]*$/.test(role)) {
      throw new BadRequestException(
        'Role key must be uppercase alphanumeric with underscores',
      );
    }

    await this.repository.createRole(role, label);
    return { role, label, permissions: [] };
  }

  async deleteRole(role: string): Promise<void> {
    const dbRole = await this.repository.getRole(role);
    if (!dbRole) throw new NotFoundException(`Role "${role}" not found`);
    if (dbRole.isSystem)
      throw new BadRequestException('Cannot delete a system role');

    // Remove all permission mappings for this role
    await this.repository.setPermissionsForRole(role, []);

    // Reassign users with this role to ORG_MANAGER
    await this.userModel.update(
      { role: 'ORG_MANAGER' },
      {
        where: { role },
      },
    );

    // Delete the role
    await this.repository.deleteRole(role);
  }
}
