import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'CUSTOM_MANAGER',
    description: 'Uppercase alphanumeric key with underscores',
  })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message:
      'Role key must start with uppercase letter and contain only uppercase letters, numbers, and underscores',
  })
  @MaxLength(50)
  role!: string;

  @ApiProperty({
    example: 'Custom Manager',
    description: 'Human-readable label',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label!: string;
}
