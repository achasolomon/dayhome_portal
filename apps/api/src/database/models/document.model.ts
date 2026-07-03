import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Dayhome } from './dayhome.model';
import { Educator } from './educator.model';

@Table({ tableName: 'documents', paranoid: true })
export class Document extends Model<Document> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Dayhome)
  @Column({ type: DataType.UUID })
  declare dayhomeId: string;

  @BelongsTo(() => Dayhome)
  declare dayhome: Dayhome;

  @ForeignKey(() => Educator)
  @Column({ type: DataType.UUID })
  declare educatorId: string;

  @BelongsTo(() => Educator)
  declare educator: Educator;

  @Column({
    type: DataType.ENUM(
      'LICENSE',
      'INSURANCE',
      'FIRE_INSPECTION',
      'HEALTH_INSPECTION',
      'FIRST_AID_CERT',
      'POLICE_CHECK',
      'TRAINING_CERT',
      'OTHER',
    ),
    allowNull: false,
  })
  declare documentType: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare fileUrl: string;

  @Column({ type: DataType.DATEONLY })
  declare expiryDate: Date;

  @Column({
    type: DataType.ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SUPERSEDED'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  declare version: number;
}
