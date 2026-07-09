import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Organization } from './organization.model';

@Table({ tableName: 'organization_settings' })
export class OrganizationSettings extends Model<OrganizationSettings> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare organizationId: string;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare operatingHours: Record<string, { open: string; close: string }>;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare holidays: Array<{ date: string; name: string; type: string }>;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare ratios: Record<string, Record<string, number>>;

  @Column({
    type: DataType.ENUM('WARN', 'BLOCK'),
    defaultValue: 'WARN',
    allowNull: false,
  })
  declare ratioBreachBehavior: 'WARN' | 'BLOCK';
}
