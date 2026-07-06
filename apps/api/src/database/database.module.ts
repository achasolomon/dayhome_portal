import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/entities/user.model';
import {
  Organization,
  Dayhome,
  Room,
  Educator,
  Family,
  Child,
  Enrollment,
  Attendance,
  Invoice,
  Document,
  Message,
  AuditLog,
  Invitation,
} from './models';

const models = [
  User,
  Organization,
  Dayhome,
  Room,
  Educator,
  Family,
  Child,
  Enrollment,
  Attendance,
  Invoice,
  Document,
  Message,
  AuditLog,
  Invitation,
];

@Global()
@Module({
  imports: [SequelizeModule.forFeature(models)],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
