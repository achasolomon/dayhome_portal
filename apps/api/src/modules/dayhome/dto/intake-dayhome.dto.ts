import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ─── Nested DTOs ────────────────────────────────────────────────

class AddressDto {
  @ApiProperty({ example: '123 Maple Street' })
  @IsString()
  line1!: string;

  @ApiProperty({ example: 'Edmonton' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'AB' })
  @IsString()
  @MaxLength(2)
  province!: string;

  @ApiProperty({ example: 'T5K 0A1' })
  @IsString()
  postalCode!: string;

  @ApiProperty({ example: '123 Maple Street, Edmonton, AB T5K 0A1' })
  @IsOptional()
  @IsString()
  full?: string;
}

class EducatorDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+14035551234' })
  @IsString()
  phone!: string;
}

class DayhomeDetailsDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ApiProperty({ example: 'house' })
  @IsString()
  @IsIn(['house', 'apartment', 'townhouse', 'other'])
  homeType!: string;

  @ApiProperty({ example: 'own' })
  @IsString()
  @IsIn(['own', 'rent', 'other'])
  homeOwnership!: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  fencedBackyard?: boolean;

  @ApiProperty({ example: 'no' })
  @IsString()
  @IsIn(['yes', 'no', 'outdoor_only'])
  smokingStatus!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasPets!: boolean;

  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsNumber()
  homeResidentsCount?: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  eveningOvernightCare!: boolean;
}

class OperationsDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  currentCapacity!: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(1)
  @Max(200)
  maximumCapacity!: number;

  @ApiProperty({ example: '07:00:00' })
  @IsString()
  operatingHoursStart!: string;

  @ApiProperty({ example: '17:30:00' })
  @IsString()
  operatingHoursEnd!: string;

  @ApiProperty({ example: 'Level 2', required: false })
  @IsOptional()
  @IsString()
  childcareLevel?: string;

  @ApiProperty({ example: 'English, French', required: false })
  @IsOptional()
  @IsString()
  languagesSpoken?: string;

  @ApiProperty({
    example: 'Early Childhood Education Diploma',
    required: false,
  })
  @IsOptional()
  @IsString()
  childcareEducation?: string;

  @ApiProperty({ example: ['Special Needs', 'Infant Care'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];
}

class LicenseDto {
  @ApiProperty({ example: 'SPICED-CERT-2026-0001' })
  @IsString()
  certificateNumber!: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  issueDate!: string;

  @ApiProperty({ example: '2027-01-15' })
  @IsDateString()
  expiryDate!: string;

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsIn(['active', 'expired', 'revoked'])
  status!: string;
}

class TimelineDto {
  @ApiProperty({ example: '2025-09-20T10:30:00Z' })
  @IsDateString()
  submittedAt!: string;

  @ApiProperty({ example: '2025-12-01T14:00:00Z' })
  @IsDateString()
  approvedAt!: string;

  @ApiProperty({ example: '2025-12-15T09:00:00Z' })
  @IsDateString()
  activatedAt!: string;

  @ApiProperty({ example: '2026-06-15', required: false })
  @IsOptional()
  @IsDateString()
  nextComplianceDue?: string;
}

class FinalInspectionDto {
  @ApiProperty({ example: '2025-11-10T11:00:00Z' })
  @IsDateString()
  conductedAt!: string;

  @ApiProperty({ example: 'pass' })
  @IsString()
  @IsIn(['pass', 'conditional', 'fail'])
  result!: string;

  @ApiProperty({ example: 96.0, required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsNumber()
  itemsPassed?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  itemsFailed?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  criticalFailures?: number;

  @ApiProperty({ example: 'All requirements met.', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ example: 'Sarah Connor', required: false })
  @IsOptional()
  @IsString()
  inspectorName?: string;
}

class DocumentDto {
  @ApiProperty({ example: 'Home Insurance' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'home_insurance_2025.pdf' })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'home_insurance' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'approved' })
  @IsString()
  @IsIn(['approved', 'pending', 'expired'])
  status!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    example:
      'https://portal.example.com/api/v1/external/documents/42/download?expires=...',
  })
  @IsString()
  downloadUrl!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;
}

class ProfileItemDto {
  @ApiProperty({ example: 'Standard First Aid' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'document' })
  @IsString()
  @IsIn(['document', 'certification', 'training'])
  type!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileName?: string;
}

// ─── Main DTO ───────────────────────────────────────────────────

export class IntakeDayhomeDto {
  @ApiProperty({ example: '1.0' })
  @IsString()
  version!: string;

  @ApiProperty({ example: 'SPC-250T5K-0001' })
  @IsString()
  externalId!: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => EducatorDto)
  educator!: EducatorDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DayhomeDetailsDto)
  dayhome!: DayhomeDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OperationsDto)
  operations!: OperationsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => LicenseDto)
  license!: LicenseDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TimelineDto)
  timeline!: TimelineDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FinalInspectionDto)
  finalInspection?: FinalInspectionDto;

  @ApiProperty({ required: false, type: [DocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @ApiProperty({ required: false, type: [ProfileItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileItemDto)
  profileItems?: ProfileItemDto[];
}
