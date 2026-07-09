import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject, IsArray, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    example: { monday: { open: '07:00', close: '18:00' } },
  })
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, { open: string; close: string }>;

  @ApiPropertyOptional({
    example: [{ date: '2026-12-25', name: 'Christmas', type: 'PUBLIC' }],
  })
  @IsOptional()
  @IsArray()
  holidays?: Array<{ date: string; name: string; type: string }>;

  @ApiPropertyOptional({
    example: { AB: { infant: 3, toddler: 5, preschool: 8 } },
  })
  @IsOptional()
  @IsObject()
  ratios?: Record<string, Record<string, number>>;

  @ApiPropertyOptional({ enum: ['WARN', 'BLOCK'] })
  @IsOptional()
  @IsIn(['WARN', 'BLOCK'])
  ratioBreachBehavior?: 'WARN' | 'BLOCK';
}
