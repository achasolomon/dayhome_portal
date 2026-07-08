import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order, WhereOptions, CreationAttributes } from 'sequelize';
import { Invitation } from './entities/staff.entity';
import { User } from './entities/staff.entity';

interface FindStaffParams {
  organizationId: string;
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class StaffRepository {
  constructor(
    @InjectModel(Invitation)
    private readonly invitationModel: typeof Invitation,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async createInvitation(
    data: CreationAttributes<Invitation>,
  ): Promise<Invitation> {
    return this.invitationModel.create(data);
  }

  async findPendingInvitationByEmail(
    email: string,
    organizationId: string,
  ): Promise<Invitation | null> {
    return this.invitationModel.findOne({
      where: {
        email,
        organizationId,
        status: 'PENDING',
        expiresAt: { [Op.gt]: new Date() },
      },
      paranoid: false,
    });
  }

  async findInvitationById(id: string): Promise<Invitation | null> {
    return this.invitationModel.findByPk(id, { paranoid: false });
  }

  async findInvitationByToken(token: string): Promise<Invitation | null> {
    return this.invitationModel.findOne({ where: { token }, paranoid: false });
  }

  async markInvitationCancelled(id: string): Promise<void> {
    await this.invitationModel.update(
      { status: 'CANCELLED' },
      { where: { id } },
    );
  }

  async markExpiredInvitations(): Promise<number> {
    const [count] = await this.invitationModel.update(
      { status: 'EXPIRED' },
      {
        where: {
          status: 'PENDING',
          expiresAt: { [Op.lt]: new Date() },
        },
      },
    );
    return count;
  }

  async markInvitationAccepted(id: string): Promise<void> {
    await this.invitationModel.update(
      { status: 'ACCEPTED', acceptedAt: new Date() },
      { where: { id } },
    );
  }

  async findStaffByOrganization(params: FindStaffParams) {
    const { organizationId, search, page, limit } = params;
    const offset = (page - 1) * limit;
    const where: WhereOptions = { organizationId };

    if (search) {
      const searchClause = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
        ],
      };
      Object.assign(where, searchClause);
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      offset,
      limit,
      paranoid: false,
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

  async findPendingInvitationsByOrganization(
    organizationId: string,
  ): Promise<Invitation[]> {
    return this.invitationModel.findAll({
      where: {
        organizationId,
        status: 'PENDING',
        expiresAt: { [Op.gt]: new Date() },
      },
      paranoid: false,
    });
  }
}
