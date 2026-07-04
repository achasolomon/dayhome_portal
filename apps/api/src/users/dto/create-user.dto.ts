import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ROLES = [
  'SUPER_ADMIN',
  'ORG_ADMIN',
  'ORG_MANAGER',
  'DAYHOME_OWNER',
  'EDUCATOR',
  'PARENT',
  'GOVERNMENT',
] as const;

export class CreateUserDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ROLES, example: 'ORG_ADMIN', required: false })
  @IsOptional()
  @IsIn(ROLES)
  role?: string;
}
