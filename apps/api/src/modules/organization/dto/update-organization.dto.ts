import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED'], required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ enum: ['system', 'dayhome', 'parent'], required: false })
  @IsOptional()
  @IsIn(['system', 'dayhome', 'parent'])
  type?: string;
}
