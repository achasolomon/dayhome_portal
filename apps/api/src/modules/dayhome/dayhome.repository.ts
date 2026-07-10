import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { Dayhome } from './entities/dayhome.entity';

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
