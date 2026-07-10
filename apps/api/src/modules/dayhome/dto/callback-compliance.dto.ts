import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallbackComplianceDto {
  @ApiProperty({ example: 'SPC-250T5K-0001' })
  @IsString()
  externalId!: string;

  @ApiProperty({ example: 'pass' })
  @IsString()
  @IsIn(['pass', 'conditional', 'fail'])
  result!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  itemsPassed?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  itemsFailed?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  criticalFailures?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inspectorName?: string;

  @ApiProperty({ example: '2026-07-09T10:00:00Z' })
  @IsDateString()
  conductedAt!: string;

  @ApiProperty({ example: '2027-07-09' })
  @IsDateString()
  nextComplianceDue!: string;
}
