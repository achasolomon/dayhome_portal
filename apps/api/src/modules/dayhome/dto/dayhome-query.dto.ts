import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DayhomeStatus } from '../entities/dayhome-status.enum';
import { PAGINATION } from '@spiced-dayhome/shared-types';

export class DayhomeQueryDto {
  @ApiProperty({ required: false, enum: DayhomeStatus })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(DayhomeStatus))
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: PAGINATION.DEFAULT_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiProperty({ required: false, default: PAGINATION.DEFAULT_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  limit?: number = PAGINATION.DEFAULT_LIMIT;
}
