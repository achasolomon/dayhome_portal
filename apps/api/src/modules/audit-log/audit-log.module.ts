import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogAccessGuard } from './guards/audit-log-access.guard';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditLogRepository,
    AuditLogInterceptor,
    AuditLogAccessGuard,
  ],
  exports: [
    AuditLogService,
    AuditLogRepository,
    AuditLogInterceptor,
    AuditLogAccessGuard,
  ],
})
export class AuditLogModule {}
