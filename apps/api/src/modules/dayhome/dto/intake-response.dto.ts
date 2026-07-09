import { ApiProperty } from '@nestjs/swagger';
import { Dayhome } from '../entities/dayhome.entity';

export class IntakeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  externalId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  createdAt!: Date;

  static from(dayhome: Dayhome): IntakeResponseDto {
    return {
      id: dayhome.id,
      externalId: dayhome.externalId,
      name: dayhome.name,
      status: dayhome.status,
      ownerId: dayhome.ownerId,
      createdAt: dayhome.createdAt as Date,
    };
  }
}
