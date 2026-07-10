import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallbackStatusDto {
  @ApiProperty({ example: 'SPC-250T5K-0001' })
  @IsString()
  externalId!: string;

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsIn(['active', 'suspended', 'terminated', 'compliance_inspection_due'])
  status!: string;

  @ApiProperty({
    required: false,
    example: 'Annual compliance review initiated',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: '2026-07-09T14:30:00Z' })
  @IsDateString()
  timestamp!: string;
}
