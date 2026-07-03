import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Family } from './family.model';
import { Dayhome } from './dayhome.model';

@Table({ tableName: 'invoices', paranoid: true })
export class Invoice extends Model<Invoice> {
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

  @ForeignKey(() => Dayhome)
  @Column({ type: DataType.UUID, allowNull: false })
  declare dayhomeId: string;

  @BelongsTo(() => Dayhome)
  declare dayhome: Dayhome;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare totalAmount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  declare subsidyAmount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  declare paidAmount: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare dueDate: Date;

  @Column({
    type: DataType.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'DRAFT',
  })
  declare status: string;
}
