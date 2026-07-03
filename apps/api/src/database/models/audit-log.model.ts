import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'audit_logs' })
export class AuditLog extends Model<AuditLog> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare action: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare entity: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare entityId: string;

  @Column({ type: DataType.JSONB })
  declare before: object;

  @Column({ type: DataType.JSONB })
  declare after: object;
}
