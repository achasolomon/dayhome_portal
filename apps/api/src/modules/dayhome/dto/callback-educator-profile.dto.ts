import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ProfileItemDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'document' })
  @IsString()
  @IsIn(['document', 'certification', 'training'])
  type!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileName?: string;
}

export class CallbackEducatorProfileDto {
  @ApiProperty({ example: 'SPC-250T5K-0001' })
  @IsString()
  externalId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentCapacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maximumCapacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  operatingHoursStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  operatingHoursEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  childcareLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  languagesSpoken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  childcareEducation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiProperty({ required: false, type: [ProfileItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileItemDto)
  profileItems?: ProfileItemDto[];
}
