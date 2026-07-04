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
  organizationId?: string;

  @ApiProperty()
  dayhomeId?: string;

  @ApiProperty()
  permissions?: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromModel(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      dayhomeId: user.dayhomeId,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
