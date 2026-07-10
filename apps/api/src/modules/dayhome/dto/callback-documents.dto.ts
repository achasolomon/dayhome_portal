import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CallbackDocumentItemDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'home_insurance' })
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  @IsIn(['renewed', 'expired', 'replaced', 'updated'])
  action!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class CallbackDocumentsDto {
  @ApiProperty({ example: 'SPC-250T5K-0001' })
  @IsString()
  externalId!: string;

  @ApiProperty({ type: [CallbackDocumentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallbackDocumentItemDto)
  documents!: CallbackDocumentItemDto[];
}
