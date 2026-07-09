import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AuditLogQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ required: false, description: 'Start date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
