import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Organization } from './organization.model';
import { Room } from './room.model';
import { Educator } from './educator.model';
import { Document } from './document.model';
import { Enrollment } from './enrollment.model';
import { User } from '../../users/entities/user.model';

@Table({ tableName: 'dayhomes', paranoid: true })
export class Dayhome extends Model<Dayhome> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false })
  declare organizationId: string;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare ownerId: string;

  @BelongsTo(() => User)
  declare owner: User;

  @Column({ type: DataType.STRING(50), unique: true })
  declare externalId: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.JSONB })
  declare rawPayload: object;

  // ─── Educator (DAYHOME_OWNER) fields ────────────────────────
  @Column({ type: DataType.STRING(100) })
  declare educatorFirstName: string;

  @Column({ type: DataType.STRING(100) })
  declare educatorLastName: string;

  @Column({ type: DataType.STRING(255) })
  declare educatorEmail: string;

  @Column({ type: DataType.STRING(20) })
  declare educatorPhone: string;

  // ─── Address fields ─────────────────────────────────────────
  @Column({ type: DataType.STRING(255) })
  declare addressLine1: string;

  @Column({ type: DataType.STRING(100) })
  declare addressCity: string;

  @Column({ type: DataType.STRING(2) })
  declare addressProvince: string;

  @Column({ type: DataType.STRING(7) })
  declare addressPostalCode: string;

  @Column({ type: DataType.TEXT })
  declare addressFull: string;

  // ─── Home property fields ───────────────────────────────────
  @Column({
    type: DataType.ENUM('house', 'apartment', 'townhouse', 'other'),
  })
  declare homeType: string;

  @Column({
    type: DataType.ENUM('own', 'rent', 'other'),
  })
  declare homeOwnership: string;

  @Column({ type: DataType.BOOLEAN })
  declare fencedBackyard: boolean;

  @Column({
    type: DataType.ENUM('yes', 'no', 'outdoor_only'),
  })
  declare smokingStatus: string;

  @Column({ type: DataType.BOOLEAN })
  declare hasPets: boolean;

  @Column({ type: DataType.INTEGER })
  declare homeResidentsCount: number;

  @Column({ type: DataType.BOOLEAN })
  declare eveningOvernightCare: boolean;

  // ─── Operations fields ──────────────────────────────────────
  @Column({ type: DataType.INTEGER })
  declare currentCapacity: number;

  @Column({ type: DataType.INTEGER })
  declare maximumCapacity: number;

  @Column({ type: DataType.TIME })
  declare operatingHoursStart: string;

  @Column({ type: DataType.TIME })
  declare operatingHoursEnd: string;

  @Column({ type: DataType.STRING(100) })
  declare childcareLevel: string;

  @Column({ type: DataType.STRING(255) })
  declare languagesSpoken: string;

  @Column({ type: DataType.TEXT })
  declare childcareEducation: string;

  @Column({ type: DataType.JSONB })
  declare specializations: string[];

  // ─── License fields ─────────────────────────────────────────
  @Column({ type: DataType.STRING(100) })
  declare certificateNumber: string;

  @Column({ type: DataType.DATE })
  declare licenseIssueDate: Date;

  @Column({ type: DataType.DATE })
  declare licenseExpiryDate: Date;

  @Column({ type: DataType.STRING(20) })
  declare licenseStatus: string;

  // ─── Status ─────────────────────────────────────────────────
  @Column({
    type: DataType.ENUM('ACTIVE', 'SUSPENDED', 'CLOSED'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;

  @Column({ type: DataType.STRING(50) })
  declare portalStatus: string;

  // ─── Timeline fields ────────────────────────────────────────
  @Column({ type: DataType.DATE })
  declare submittedAt: Date;

  @Column({ type: DataType.DATE })
  declare approvedAt: Date;

  @Column({ type: DataType.DATE })
  declare activatedAt: Date;

  @Column({ type: DataType.DATE })
  declare nextComplianceDue: Date;

  // ─── Final inspection fields ────────────────────────────────
  @Column({ type: DataType.DATE })
  declare inspectionConductedAt: Date;

  @Column({
    type: DataType.ENUM('pass', 'conditional', 'fail'),
  })
  declare inspectionResult: string;

  @Column({ type: DataType.DECIMAL(5, 1) })
  declare inspectionScore: number;

  @Column({ type: DataType.INTEGER })
  declare inspectionItemsPassed: number;

  @Column({ type: DataType.INTEGER })
  declare inspectionItemsFailed: number;

  @Column({ type: DataType.INTEGER })
  declare inspectionCriticalFailures: number;

  @Column({ type: DataType.TEXT })
  declare inspectionSummary: string;

  @Column({ type: DataType.STRING(255) })
  declare inspectionInspectorName: string;

  // ─── Profile items (certifications / training) ──────────────
  @Column({ type: DataType.JSONB })
  declare profileItems: object[];

  // ─── Relations ──────────────────────────────────────────────
  @HasMany(() => Room)
  declare rooms: Room[];

  @HasMany(() => Educator)
  declare educators: Educator[];

  @HasMany(() => Document)
  declare documents: Document[];

  @HasMany(() => Enrollment)
  declare enrollments: Enrollment[];
}
