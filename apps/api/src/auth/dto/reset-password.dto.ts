import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NewP@ssword123' })
  @IsString()
  @MinLength(6)
  password!: string;
}
