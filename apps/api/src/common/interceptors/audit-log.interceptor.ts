import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/system/audit.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Only log mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const start = Date.now();
    const controllerName = context.getClass().name;
    const moduleName = controllerName.replace('Controller', '').toLowerCase();

    return next.handle().pipe(
      tap({
        next: (data) => {
          void (async () => {
            const durationMs = Date.now() - start;
            const tenantId = this.cls.get('tenantId') || request.tenantId;
            const userId = user?.id || null;

            try {
              await this.auditService.log({
                tenantId,
                userId,
                action: method,
                module: moduleName,
                description: `${method} request to ${url}`,
                entityType: moduleName,
                entityId: data?.id || request.params?.id || null,
                newValue: method !== 'DELETE' ? data : null,
                ipAddress: ip,
                userAgent: headers['user-agent'],
                durationMs,
              });
            } catch (error) {
              const err =
                error instanceof Error ? error : new Error(String(error));
              this.logger.error(
                `Failed to save audit log: ${err.message}`,
                err.stack,
              );
            }
          })();
        },
        error: (err) => {
          // Optionally log failed attempts as well
          this.logger.warn(`${method} ${url} failed: ${err.message}`);
        },
      }),
    );
  }
}
