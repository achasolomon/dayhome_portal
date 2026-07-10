import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { Dayhome } from './dayhome.model';
import { Family } from './family.model';

@Table({ tableName: 'organizations', paranoid: true })
export class Organization extends Model<Organization> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  declare email: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'SUSPENDED'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;

  @Column({
    type: DataType.ENUM('system', 'dayhome', 'parent'),
    defaultValue: 'dayhome',
  })
  declare type: string;

  @HasMany(() => Dayhome)
  declare dayhomes: Dayhome[];

  @HasMany(() => Family)
  declare families: Family[];
}
