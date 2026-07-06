import { ApiProperty } from '@nestjs/swagger';

export class StaffMemberDto {
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
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  static from(user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    deletedAt?: Date | null;
  }): StaffMemberDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.deletedAt ? 'ARCHIVED' : 'ACTIVE',
      createdAt: user.createdAt,
    };
  }
}

export class InvitationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty()
  createdAt!: Date;

  static from(invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: Date;
    createdAt: Date;
  }): InvitationResponseDto {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }
}
