import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entity!: string;

  @ApiProperty()
  entityId!: string;

  @ApiProperty({ required: false })
  before?: Record<string, unknown>;

  @ApiProperty({ required: false })
  after?: Record<string, unknown>;

  @ApiProperty()
  createdAt!: Date;

  static from(log: AuditLog): AuditLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      before: log.before as Record<string, unknown> | undefined,
      after: log.after as Record<string, unknown> | undefined,
      createdAt: log.createdAt as Date,
    };
  }
}
