import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Spiced Childcare HQ' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'admin@spiced.ca' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ACTIVE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ enum: ['system', 'dayhome', 'parent'], default: 'dayhome' })
  @IsIn(['system', 'dayhome', 'parent'])
  type!: string;
}
