import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order } from 'sequelize';
import { Organization } from './entities/organization.entity';

interface FindAllParams {
  search?: string;
  status?: string;
  page: number;
  limit: number;
  includeDeleted?: string;
}

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel(Organization)
    private readonly orgModel: typeof Organization,
  ) {}

  async create(data: {
    name: string;
    email: string;
    status: string;
  }): Promise<Organization> {
    return this.orgModel.create(data as unknown as Organization);
  }

  async findByEmail(
    email: string,
    options?: { excludeId?: string },
  ): Promise<Organization | null> {
    const where: Record<string, unknown> = { email };
    if (options?.excludeId) {
      where.id = { [Op.ne]: options.excludeId };
    }
    return this.orgModel.findOne({ where, paranoid: false });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.orgModel.findByPk(id);
  }

  async findAll(params: FindAllParams) {
    const { search, status, page, limit, includeDeleted } = params;
    const offset = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await this.orgModel.findAndCountAll({
      where,
      offset,
      limit,
      paranoid: includeDeleted !== 'true',
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

  async update(
    id: string,
    data: Partial<Pick<Organization, 'name' | 'email' | 'status'>>,
  ): Promise<Organization | null> {
    const org = await this.findById(id);
    if (!org) return null;
    await org.update(data);
    return org.reload();
  }

  async remove(id: string): Promise<boolean> {
    const org = await this.findById(id);
    if (!org) return false;
    await org.destroy();
    return true;
  }
}
