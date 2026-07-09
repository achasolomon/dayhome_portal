import { ApiProperty } from '@nestjs/swagger';
import { OrganizationSettings } from '../entities/settings.entity';

export class SettingsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  operatingHours!: Record<string, { open: string; close: string }>;

  @ApiProperty()
  holidays!: Array<{ date: string; name: string; type: string }>;

  @ApiProperty()
  ratios!: Record<string, Record<string, number>>;

  @ApiProperty({ enum: ['WARN', 'BLOCK'] })
  ratioBreachBehavior!: 'WARN' | 'BLOCK';

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static from(settings: OrganizationSettings): SettingsResponseDto {
    return {
      id: settings.id,
      organizationId: settings.organizationId,
      operatingHours: settings.operatingHours,
      holidays: settings.holidays,
      ratios: settings.ratios,
      ratioBreachBehavior: settings.ratioBreachBehavior,
      createdAt: settings.createdAt as Date,
      updatedAt: settings.updatedAt as Date,
    };
  }
}
