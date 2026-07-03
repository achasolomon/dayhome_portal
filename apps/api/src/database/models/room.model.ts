import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Dayhome } from './dayhome.model';

@Table({ tableName: 'rooms', paranoid: true })
export class Room extends Model<Room> {
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
  declare name: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare capacity: number;

  @Column({
    type: DataType.ENUM('INFANT', 'TODDLER', 'PRESCHOOL', 'SCHOOL_AGE'),
  })
  declare ageGroup: string;
}
