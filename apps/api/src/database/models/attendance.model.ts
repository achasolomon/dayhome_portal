import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Child } from './child.model';
import { Educator } from './educator.model';

@Table({ tableName: 'attendance_records' })
export class Attendance extends Model<Attendance> {
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

  @ForeignKey(() => Educator)
  @Column({ type: DataType.UUID, allowNull: false })
  declare checkedInBy: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare checkInTime: Date;

  @ForeignKey(() => Educator)
  @Column({ type: DataType.UUID })
  declare checkedOutBy: string;

  @Column({ type: DataType.DATE })
  declare checkOutTime: Date;

  @Column({
    type: DataType.ENUM('PRESENT', 'ABSENT', 'LATE'),
    defaultValue: 'PRESENT',
  })
  declare status: string;
}
