import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, Op, Order, WhereOptions } from 'sequelize';
import { Dayhome } from './entities/dayhome.entity';

export interface FindAllDayhomesParams {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class DayhomeRepository {
  constructor(
    @InjectModel(Dayhome)
    private readonly dayhomeModel: typeof Dayhome,
  ) {}

  async findById(id: string): Promise<Dayhome | null> {
    return this.dayhomeModel.findByPk(id);
  }

  async findByExternalId(externalId: string): Promise<Dayhome | null> {
    return this.dayhomeModel.findOne({ where: { externalId } });
  }

  async findAll(
    params: FindAllDayhomesParams,
  ): Promise<PaginatedResult<Dayhome>> {
    const { status, search, page, limit } = params;
    const offset = (page - 1) * limit;
    const where: WhereOptions = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      const term = `%${search}%`;
      where[Op.or as keyof WhereOptions] = [
        { name: { [Op.iLike]: term } },
        { addressLine1: { [Op.iLike]: term } },
        { addressCity: { [Op.iLike]: term } },
        { educatorFirstName: { [Op.iLike]: term } },
        { educatorLastName: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.dayhomeModel.findAndCountAll({
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

  async create(data: CreationAttributes<Dayhome>): Promise<Dayhome> {
    return this.dayhomeModel.create(data);
  }

  async update(
    id: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<void> {
    await this.dayhomeModel.update(data, { where: { id } });
  }
}
