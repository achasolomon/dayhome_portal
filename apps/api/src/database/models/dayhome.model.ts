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
import { Room } from './room.model';
import { Educator } from './educator.model';
import { Document } from './document.model';
import { Enrollment } from './enrollment.model';

@Table({ tableName: 'dayhomes', paranoid: true })
export class Dayhome extends Model<Dayhome> {
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
  declare name: string;

  @Column({ type: DataType.TEXT })
  declare address: string;

  @Column({ type: DataType.INTEGER })
  declare capacity: number;

  @Column({
    type: DataType.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'CLOSED'),
    defaultValue: 'PENDING',
  })
  declare status: string;

  @Column({ type: DataType.STRING(100) })
  declare licenseNumber: string;

  @Column({ type: DataType.DATE })
  declare licenseExpiry: Date;

  @HasMany(() => Room)
  declare rooms: Room[];

  @HasMany(() => Educator)
  declare educators: Educator[];

  @HasMany(() => Document)
  declare documents: Document[];

  @HasMany(() => Enrollment)
  declare enrollments: Enrollment[];
}
