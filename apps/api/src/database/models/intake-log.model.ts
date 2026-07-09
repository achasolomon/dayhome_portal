import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Dayhome } from './dayhome.model';

@Table({ tableName: 'intake_logs', timestamps: true })
export class IntakeLog extends Model<IntakeLog> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(50) })
  declare externalId: string;

  @Column({ type: DataType.STRING(255) })
  declare idempotencyKey: string;

  @Column({
    type: DataType.ENUM('success', 'flagged_for_review', 'failed'),
    allowNull: false,
  })
  declare status: string;

  @Column({ type: DataType.BOOLEAN })
  declare signatureValid: boolean;

  @Column({ type: DataType.JSONB })
  declare validationErrors: object[];

  @Column({ type: DataType.JSONB })
  declare rawRequestBody: object;

  @Column({ type: DataType.INTEGER })
  declare responseStatusCode: number;

  @ForeignKey(() => Dayhome)
  @Column({ type: DataType.UUID, allowNull: true })
  declare dayhomeId: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare updatedAt: Date;
}
