import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order } from 'sequelize';
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

  async createInvitation(data: {
    email: string;
    role: string;
    organizationId: string;
    token: string;
    expiresAt: Date;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<Invitation> {
    return this.invitationModel.create(data as unknown as Invitation);
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

  async findInvitationByToken(token: string): Promise<Invitation | null> {
    return this.invitationModel.findOne({ where: { token }, paranoid: false });
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
    const where: Record<string, unknown> = { organizationId };

    if (search) {
      where[Op.or as unknown as string] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
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
