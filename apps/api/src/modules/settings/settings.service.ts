import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { OrganizationSettings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  async getByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationSettings> {
    const settings = await this.repository.findByOrganizationId(organizationId);
    if (!settings) {
      throw new NotFoundException({
        code: ERROR_CODES.SETTINGS_NOT_FOUND,
        message: 'Settings not found for this organization',
      });
    }
    return settings;
  }

  async upsert(
    organizationId: string,
    dto: UpdateSettingsDto,
  ): Promise<OrganizationSettings> {
    const data: Record<string, unknown> = {};
    if (dto.operatingHours !== undefined)
      data.operatingHours = dto.operatingHours;
    if (dto.holidays !== undefined) data.holidays = dto.holidays;
    if (dto.ratios !== undefined) data.ratios = dto.ratios;
    if (dto.ratioBreachBehavior !== undefined)
      data.ratioBreachBehavior = dto.ratioBreachBehavior;

    return this.repository.upsert(organizationId, data);
  }
}
