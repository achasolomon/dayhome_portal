import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Dayhome } from './entities/dayhome.entity';

@Injectable()
export class DayhomeRepository {
  constructor(
    @InjectModel(Dayhome)
    private readonly dayhomeModel: typeof Dayhome,
  ) {}
}
