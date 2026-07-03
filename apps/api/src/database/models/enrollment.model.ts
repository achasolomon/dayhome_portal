import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Child } from './child.model';
import { Dayhome } from './dayhome.model';
import { Room } from './room.model';

@Table({ tableName: 'enrollments', paranoid: true })
export class Enrollment extends Model<Enrollment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Child)
  @Column({ type: DataType.UUID, allowNull: false })
  declare childId: string;

  @BelongsTo(() => Child)
  declare child: Child;

  @ForeignKey(() => Dayhome)
  @Column({ type: DataType.UUID, allowNull: false })
  declare dayhomeId: string;

  @BelongsTo(() => Dayhome)
  declare dayhome: Dayhome;

  @ForeignKey(() => Room)
  @Column({ type: DataType.UUID })
  declare roomId: string;

  @BelongsTo(() => Room)
  declare room: Room;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare startDate: Date;

  @Column({ type: DataType.DATEONLY })
  declare endDate: Date;

  @Column({
    type: DataType.ENUM('ACTIVE', 'WAITLISTED', 'WITHDRAWN'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;
}
