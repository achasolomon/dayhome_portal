import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_MANAGER = 'ORG_MANAGER',
  BILLING_ONLY = 'BILLING_ONLY',
  DAYHOME_OWNER = 'DAYHOME_OWNER',
  EDUCATOR = 'EDUCATOR',
  PARENT = 'PARENT',
  GOVERNMENT = 'GOVERNMENT',
}

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM(
      'SUPER_ADMIN',
      'ORG_ADMIN',
      'ORG_MANAGER',
      'BILLING_ONLY',
      'DAYHOME_OWNER',
      'EDUCATOR',
      'PARENT',
      'GOVERNMENT',
    ),
    defaultValue: 'ORG_ADMIN',
    allowNull: false,
  })
  declare role: string;

  @Column({ type: DataType.STRING(100) })
  declare firstName: string;

  @Column({ type: DataType.STRING(100) })
  declare lastName: string;

  @Column({ type: DataType.STRING(20) })
  declare phone: string;

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare permissions: string[];

  @Column({ type: DataType.UUID })
  declare organizationId: string;

  @Column({ type: DataType.UUID })
  declare dayhomeId: string;

  @Column({ type: DataType.TEXT })
  declare refreshToken: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare updatedAt: Date;

  @Column({ type: DataType.DATE })
  declare deletedAt: Date | null;
}
