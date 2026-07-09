import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_KEY, AuditLogOptions } from './audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<AuditLogOptions>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          this.createLog(context, options, responseBody);
        },
        error: () => {
          // Do not log failed requests — only successful mutations
        },
      }),
    );
  }

  private createLog(
    context: ExecutionContext,
    options: AuditLogOptions,
    responseBody: unknown,
  ): void {
    try {
      const request = context.switchToHttp().getRequest<{
        user?: { id?: string };
        params?: Record<string, string>;
      }>();
      const userId = request.user?.id;
      if (!userId) return;

      let entityId: string | undefined;
      if (
        responseBody &&
        typeof responseBody === 'object' &&
        'id' in (responseBody as Record<string, unknown>)
      ) {
        entityId = (responseBody as Record<string, unknown>).id as string;
      }

      if (!entityId && request.params?.id) {
        entityId = request.params.id;
      }

      if (!entityId && request.params?.role) {
        entityId = request.params.role;
      }

      if (!entityId) return;

      void this.auditLogService.create({
        userId,
        action: options.action,
        entity: options.entity,
        entityId,
        after: responseBody as Record<string, unknown>,
      });
    } catch {
      // Audit logging must never throw or break the main flow
    }
  }
}
