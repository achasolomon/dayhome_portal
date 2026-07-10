import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.model';

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  organizationId?: string;

  @ApiProperty()
  organizationType?: string;

  @ApiProperty()
  dayhomeId?: string;

  @ApiProperty()
  permissions?: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromModel(user: User, organizationType?: string): UserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      organizationId: user.organizationId,
      organizationType: organizationType,
      dayhomeId: user.dayhomeId,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
