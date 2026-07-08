import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../entities/organization.entity';

export class OrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  static from(org: Organization): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      email: org.email,
      status: org.status,
      createdAt: org.createdAt as Date,
      updatedAt: org.updatedAt as Date,
      deletedAt: org.deletedAt as Date | undefined,
    };
  }
}
