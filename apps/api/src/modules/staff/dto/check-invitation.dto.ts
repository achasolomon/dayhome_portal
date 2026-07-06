import { ApiProperty } from '@nestjs/swagger';

export class CheckInvitationDto {
  @ApiProperty()
  valid!: boolean;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  message?: string;
}
