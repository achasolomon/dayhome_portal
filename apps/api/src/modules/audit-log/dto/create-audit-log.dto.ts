import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsUUID()
  userId!: string;

  @IsString()
  action!: string;

  @IsString()
  entity!: string;

  @IsUUID()
  entityId!: string;

  @IsOptional()
  @IsObject()
  before?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  after?: Record<string, unknown>;
}
