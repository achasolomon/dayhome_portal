import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { Organization } from './entities/organization.entity';
import { OrganizationAccessGuard } from './guards/organization-access.guard';

@Module({
  imports: [SequelizeModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationAccessGuard,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
