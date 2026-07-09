import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '@spiced-dayhome/shared-types';
import { CreationAttributes } from 'sequelize';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const data: Record<string, unknown> = {
      userId: dto.userId,
      action: dto.action,
      entity: dto.entity,
      entityId: dto.entityId,
    };
    if (dto.before) data.before = dto.before;
    if (dto.after) data.after = dto.after;
    return this.repository.create(data as CreationAttributes<AuditLog>);
  }

  async findById(id: string): Promise<AuditLog> {
    const log = await this.repository.findById(id);
    if (!log) {
      throw new NotFoundException({
        code: ERROR_CODES.AUDIT_LOG_NOT_FOUND,
        message: `Audit log not found with id ${id}`,
      });
    }
    return log;
  }

  async findAll(query: AuditLogQueryDto) {
    return this.repository.findAll({
      userId: query.userId,
      action: query.action,
      entity: query.entity,
      entityId: query.entityId,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
