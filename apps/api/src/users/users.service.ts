import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const data = {
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
      role: dto.role ?? 'ORG_MANAGER',
      organizationId: dto.organizationId ?? null,
    };
    return this.userModel.create(data as CreationAttributes<User>);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ where: { resetToken: token } });
  }
}
