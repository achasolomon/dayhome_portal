import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Organization } from './organization.model';
import { Child } from './child.model';

@Table({ tableName: 'families', paranoid: true })
export class Family extends Model<Family> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false })
  declare organizationId: string;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare primaryContactName: string;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(20) })
  declare phone: string;

  @Column({ type: DataType.STRING(255) })
  declare passwordHash: string;

  @HasMany(() => Child)
  declare children: Child[];
}
