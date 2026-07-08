import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'role_permissions', timestamps: true })
export class RolePermission extends Model<RolePermission> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare role: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare permission: string;
}
