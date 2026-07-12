import { ApiProperty } from '@nestjs/swagger';
import { Dayhome } from '../entities/dayhome.entity';

export class DayhomeDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  externalId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  portalStatus!: string;

  // Educator
  @ApiProperty()
  educatorFirstName!: string;

  @ApiProperty()
  educatorLastName!: string;

  @ApiProperty()
  educatorEmail!: string;

  @ApiProperty()
  educatorPhone!: string;

  // Address
  @ApiProperty()
  addressLine1!: string;

  @ApiProperty()
  addressCity!: string;

  @ApiProperty()
  addressProvince!: string;

  @ApiProperty()
  addressPostalCode!: string;

  @ApiProperty()
  addressFull!: string;

  // Home
  @ApiProperty()
  homeType!: string;

  @ApiProperty()
  homeOwnership!: string;

  @ApiProperty()
  fencedBackyard!: boolean;

  @ApiProperty()
  smokingStatus!: string;

  @ApiProperty()
  hasPets!: boolean;

  @ApiProperty()
  homeResidentsCount!: number;

  @ApiProperty()
  eveningOvernightCare!: boolean;

  // Operations
  @ApiProperty()
  currentCapacity!: number;

  @ApiProperty()
  maximumCapacity!: number;

  @ApiProperty()
  operatingHoursStart!: string;

  @ApiProperty()
  operatingHoursEnd!: string;

  @ApiProperty({ required: false })
  childcareLevel?: string;

  @ApiProperty({ required: false })
  languagesSpoken?: string;

  @ApiProperty({ required: false })
  childcareEducation?: string;

  @ApiProperty({ required: false })
  specializations?: string[];

  // License
  @ApiProperty()
  certificateNumber!: string;

  @ApiProperty()
  licenseIssueDate!: Date;

  @ApiProperty()
  licenseExpiryDate!: Date;

  @ApiProperty()
  licenseStatus!: string;

  // Timeline
  @ApiProperty()
  submittedAt!: Date;

  @ApiProperty()
  approvedAt!: Date;

  @ApiProperty()
  activatedAt!: Date;

  @ApiProperty({ required: false })
  nextComplianceDue?: Date;

  // Inspection
  @ApiProperty({ required: false })
  inspectionConductedAt?: Date;

  @ApiProperty({ required: false })
  inspectionResult?: string;

  @ApiProperty({ required: false })
  inspectionScore?: number;

  @ApiProperty({ required: false })
  inspectionItemsPassed?: number;

  @ApiProperty({ required: false })
  inspectionItemsFailed?: number;

  @ApiProperty({ required: false })
  inspectionCriticalFailures?: number;

  @ApiProperty({ required: false })
  inspectionSummary?: string;

  @ApiProperty({ required: false })
  inspectionInspectorName?: string;

  // Profile items
  @ApiProperty({ required: false })
  profileItems?: object[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static from(dayhome: Dayhome): DayhomeDetailDto {
    return {
      id: dayhome.id,
      organizationId: dayhome.organizationId,
      ownerId: dayhome.ownerId,
      externalId: dayhome.externalId ?? '',
      name: dayhome.name,
      status: dayhome.status,
      portalStatus: dayhome.portalStatus ?? '',
      educatorFirstName: dayhome.educatorFirstName,
      educatorLastName: dayhome.educatorLastName,
      educatorEmail: dayhome.educatorEmail,
      educatorPhone: dayhome.educatorPhone,
      addressLine1: dayhome.addressLine1,
      addressCity: dayhome.addressCity,
      addressProvince: dayhome.addressProvince,
      addressPostalCode: dayhome.addressPostalCode,
      addressFull: dayhome.addressFull,
      homeType: dayhome.homeType,
      homeOwnership: dayhome.homeOwnership,
      fencedBackyard: dayhome.fencedBackyard,
      smokingStatus: dayhome.smokingStatus,
      hasPets: dayhome.hasPets,
      homeResidentsCount: dayhome.homeResidentsCount,
      eveningOvernightCare: dayhome.eveningOvernightCare,
      currentCapacity: dayhome.currentCapacity,
      maximumCapacity: dayhome.maximumCapacity,
      operatingHoursStart: dayhome.operatingHoursStart,
      operatingHoursEnd: dayhome.operatingHoursEnd,
      childcareLevel: dayhome.childcareLevel ?? undefined,
      languagesSpoken: dayhome.languagesSpoken ?? undefined,
      childcareEducation: dayhome.childcareEducation ?? undefined,
      specializations: dayhome.specializations,
      certificateNumber: dayhome.certificateNumber,
      licenseIssueDate: dayhome.licenseIssueDate,
      licenseExpiryDate: dayhome.licenseExpiryDate,
      licenseStatus: dayhome.licenseStatus,
      submittedAt: dayhome.submittedAt,
      approvedAt: dayhome.approvedAt,
      activatedAt: dayhome.activatedAt,
      nextComplianceDue: dayhome.nextComplianceDue,
      inspectionConductedAt: dayhome.inspectionConductedAt,
      inspectionResult: dayhome.inspectionResult ?? undefined,
      inspectionScore: dayhome.inspectionScore,
      inspectionItemsPassed: dayhome.inspectionItemsPassed,
      inspectionItemsFailed: dayhome.inspectionItemsFailed,
      inspectionCriticalFailures: dayhome.inspectionCriticalFailures,
      inspectionSummary: dayhome.inspectionSummary ?? undefined,
      inspectionInspectorName: dayhome.inspectionInspectorName ?? undefined,
      profileItems: dayhome.profileItems,
      createdAt: dayhome.createdAt as Date,
      updatedAt: dayhome.updatedAt as Date,
    };
  }
}
