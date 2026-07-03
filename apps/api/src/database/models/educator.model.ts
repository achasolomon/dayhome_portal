import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Dayhome } from './dayhome.model';

@Table({ tableName: 'educators', paranoid: true })
export class Educator extends Model<Educator> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Dayhome)
  @Column({ type: DataType.UUID, allowNull: false })
  declare dayhomeId: string;

  @BelongsTo(() => Dayhome)
  declare dayhome: Dayhome;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(20) })
  declare phone: string;

  @Column({ type: DataType.STRING(255) })
  declare passwordHash: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'ON_LEAVE', 'TERMINATED'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;
}
