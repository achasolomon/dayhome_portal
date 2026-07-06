import {
  IsEmail,
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
}
