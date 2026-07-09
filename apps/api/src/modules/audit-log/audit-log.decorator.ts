import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogOptions {
  action: string;
  entity: string;
}

export const AuditLog = (options: AuditLogOptions): MethodDecorator =>
  SetMetadata(AUDIT_LOG_KEY, options);
