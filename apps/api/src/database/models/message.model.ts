import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Educator } from './educator.model';
import { Family } from './family.model';

@Table({ tableName: 'messages' })
export class Message extends Model<Message> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare threadId: string;

  @ForeignKey(() => Educator)
  @Column({ type: DataType.UUID })
  declare senderEducatorId: string;

  @BelongsTo(() => Educator, 'senderEducatorId')
  declare senderEducator: Educator;

  @ForeignKey(() => Family)
  @Column({ type: DataType.UUID })
  declare senderFamilyId: string;

  @BelongsTo(() => Family, 'senderFamilyId')
  declare senderFamily: Family;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare body: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isRead: boolean;
}
