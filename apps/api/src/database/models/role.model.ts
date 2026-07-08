import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'roles', timestamps: true })
export class Role extends Model<Role> {
  @Column({
    type: DataType.STRING(50),
    primaryKey: true,
  })
  declare role: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare label: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isSystem: boolean;
}
