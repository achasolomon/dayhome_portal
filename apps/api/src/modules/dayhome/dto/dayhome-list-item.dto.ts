import { ApiProperty } from '@nestjs/swagger';
import { Dayhome } from '../entities/dayhome.entity';

export class DayhomeListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  educatorFirstName!: string;

  @ApiProperty()
  educatorLastName!: string;

  @ApiProperty()
  educatorEmail!: string;

  @ApiProperty()
  addressCity!: string;

  @ApiProperty()
  addressProvince!: string;

  @ApiProperty()
  currentCapacity!: number;

  @ApiProperty()
  maximumCapacity!: number;

  @ApiProperty({ required: false })
  nextComplianceDue?: Date;

  @ApiProperty({ required: false })
  inspectionResult?: string;

  @ApiProperty()
  createdAt!: Date;

  static from(dayhome: Dayhome): DayhomeListItemDto {
    return {
      id: dayhome.id,
      name: dayhome.name,
      status: dayhome.status,
      educatorFirstName: dayhome.educatorFirstName,
      educatorLastName: dayhome.educatorLastName,
      educatorEmail: dayhome.educatorEmail,
      addressCity: dayhome.addressCity,
      addressProvince: dayhome.addressProvince,
      currentCapacity: dayhome.currentCapacity,
      maximumCapacity: dayhome.maximumCapacity,
      nextComplianceDue: dayhome.nextComplianceDue,
      inspectionResult: dayhome.inspectionResult,
      createdAt: dayhome.createdAt as Date,
    };
  }
}
