import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DayhomeController } from './dayhome.controller';
import { DayhomeService } from './dayhome.service';
import { DayhomeRepository } from './dayhome.repository';
import { Dayhome } from './entities/dayhome.entity';
import { IntakeLog } from './entities/intake-log.entity';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([Dayhome, IntakeLog]), UsersModule],
  controllers: [DayhomeController],
  providers: [DayhomeService, DayhomeRepository],
  exports: [DayhomeService],
})
export class DayhomeModule {}
