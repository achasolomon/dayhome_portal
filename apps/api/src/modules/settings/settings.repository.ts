import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { OrganizationSettings } from './entities/settings.entity';

@Injectable()
export class SettingsRepository {
  constructor(
    @InjectModel(OrganizationSettings)
    private readonly settingsModel: typeof OrganizationSettings,
  ) {}

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationSettings | null> {
    return this.settingsModel.findOne({ where: { organizationId } });
  }

  async upsert(
    organizationId: string,
    data: Partial<CreationAttributes<OrganizationSettings>>,
  ): Promise<OrganizationSettings> {
    const existing = await this.findByOrganizationId(organizationId);
    if (existing) {
      return existing.update(data);
    }
    return this.settingsModel.create({
      organizationId,
      ...data,
    } as CreationAttributes<OrganizationSettings>);
  }
}
