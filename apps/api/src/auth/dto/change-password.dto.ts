import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  oldPassword!: string;

  @ApiProperty({ example: 'NewP@ssword123' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
