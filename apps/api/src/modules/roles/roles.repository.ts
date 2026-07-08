import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { RolePermission } from '../../database/models/role-permission.model';
import { Role } from '../../database/models/role.model';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectModel(RolePermission)
    private readonly rpModel: typeof RolePermission,
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async getAllRoles(): Promise<Role[]> {
    return this.roleModel.findAll({ order: [['createdAt', 'ASC']] });
  }

  async getRole(role: string): Promise<Role | null> {
    return this.roleModel.findByPk(role);
  }

  async createRole(role: string, label: string): Promise<Role> {
    return this.roleModel.create({
      role,
      label,
      isSystem: false,
    } as CreationAttributes<Role>);
  }

  async deleteRole(role: string): Promise<void> {
    await this.roleModel.destroy({ where: { role } });
  }

  async getPermissionsForRole(role: string): Promise<RolePermission[]> {
    return this.rpModel.findAll({ where: { role } });
  }

  async setPermissionsForRole(
    role: string,
    permissions: string[],
  ): Promise<void> {
    await this.rpModel.destroy({ where: { role } });
    if (permissions.length > 0) {
      await this.rpModel.bulkCreate(
        permissions.map(
          (permission) =>
            ({ role, permission }) as CreationAttributes<RolePermission>,
        ),
      );
    }
  }

  async getAllMappings(): Promise<RolePermission[]> {
    return this.rpModel.findAll();
  }
}
