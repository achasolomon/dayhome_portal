import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { SettingsAccessGuard } from './guards/settings-access.guard';
import { OrganizationSettings } from './entities/settings.entity';

@Module({
  imports: [SequelizeModule.forFeature([OrganizationSettings])],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository, SettingsAccessGuard],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
