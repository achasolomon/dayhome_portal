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
    const raw = org as unknown as Record<string, Date | undefined>;
    return {
      id: org.id,
      name: org.name,
      email: org.email,
      status: org.status,
      createdAt: raw.createdAt as Date,
      updatedAt: raw.updatedAt as Date,
      deletedAt: raw.deletedAt,
    };
  }
}
