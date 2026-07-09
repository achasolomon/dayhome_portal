import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order, CreationAttributes, WhereOptions } from 'sequelize';
import { AuditLog } from './entities/audit-log.entity';

interface FindAllParams {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditLogModel: typeof AuditLog,
  ) {}

  async create(data: CreationAttributes<AuditLog>): Promise<AuditLog> {
    return this.auditLogModel.create(data);
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogModel.findByPk(id);
  }

  async findAll(params: FindAllParams) {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page,
      limit,
    } = params;
    const offset = (page - 1) * limit;
    const where: WhereOptions<AuditLog> = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
        ...(endDate ? { [Op.lte]: new Date(endDate) } : {}),
      };
    }

    const { rows, count } = await this.auditLogModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']] as Order,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
    };
  }
}
