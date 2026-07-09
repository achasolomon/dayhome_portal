import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { StaffAccessGuard } from './guards/staff-access.guard';
import { QueuesModule } from '../../queues/queues.module';
import { AuthModule } from '../../auth/auth.module';
import { Invitation } from './entities/staff.entity';
import { User } from './entities/staff.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Invitation, User]),
    QueuesModule,
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository, StaffAccessGuard],
  exports: [StaffService],
})
export class StaffModule {}
