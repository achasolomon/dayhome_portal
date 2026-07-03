import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Family } from './family.model';
import { Enrollment } from './enrollment.model';
import { Attendance } from './attendance.model';

@Table({ tableName: 'children', paranoid: true })
export class Child extends Model<Child> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Family)
  @Column({ type: DataType.UUID, allowNull: false })
  declare familyId: string;

  @BelongsTo(() => Family)
  declare family: Family;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare dateOfBirth: Date;

  @Column({
    type: DataType.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
  })
  declare gender: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  declare allergies: string[];

  @Column({ type: DataType.TEXT })
  declare medicalNotes: string;

  @HasMany(() => Enrollment)
  declare enrollments: Enrollment[];

  @HasMany(() => Attendance)
  declare attendanceRecords: Attendance[];
}
