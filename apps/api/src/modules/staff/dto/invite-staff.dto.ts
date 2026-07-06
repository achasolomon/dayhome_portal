import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const STAFF_ROLES = ['ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY'] as const;

export class InviteStaffDto {
  @ApiProperty({ example: 'john@organization.ca' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ORG_MANAGER', enum: STAFF_ROLES })
  @IsString()
  @IsIn(STAFF_ROLES)
  role!: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;
}
