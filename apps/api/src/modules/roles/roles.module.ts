import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { RolePermission } from '../../database/models/role-permission.model';
import { Role } from '../../database/models/role.model';

@Module({
  imports: [SequelizeModule.forFeature([RolePermission, Role])],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
