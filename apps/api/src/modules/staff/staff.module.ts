import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { QueuesModule } from '../../queues/queues.module';
import { Invitation } from './entities/staff.entity';
import { User } from './entities/staff.entity';

@Module({
  imports: [SequelizeModule.forFeature([Invitation, User]), QueuesModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
  exports: [StaffService],
})
export class StaffModule {}
