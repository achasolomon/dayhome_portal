import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Organization } from './organization.model';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Table({ tableName: 'invitations', timestamps: true, paranoid: true })
export class Invitation extends Model<Invitation> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare email: string;

  @Column({
    type: DataType.ENUM('ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY'),
    allowNull: false,
    defaultValue: 'ORG_MANAGER',
  })
  declare role: string;

  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false })
  declare organizationId: string;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @Column({ type: DataType.STRING(100) })
  declare firstName: string;

  @Column({ type: DataType.STRING(100) })
  declare lastName: string;

  @Column({ type: DataType.STRING(20) })
  declare phone: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare token: string;

  @Column({
    type: DataType.ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  declare status: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.DATE })
  declare acceptedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare updatedAt: Date;

  @Column({ type: DataType.DATE })
  declare deletedAt: Date | null;
}
