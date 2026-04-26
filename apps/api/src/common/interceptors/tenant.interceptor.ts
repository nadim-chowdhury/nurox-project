import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { TenantConnectionService } from '../../database/tenant-connection.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tenantId = this.cls.get('tenantId');

    if (!tenantId) {
      return next.handle();
    }

    // Wrap the entire request handler execution in a tenant context.
    // This ensures that any DB operation within the handler that uses
    // the tenant manager or follows the RLS pattern will be correctly scoped.
    return from(
      this.tenantConnection.runInTenantContext(async (manager) => {
        // We attach the tenant-scoped manager to the request so it can be used by services if needed,
        // although standard repositories won't automatically use this manager unless we use a specific pattern.
        const req = context.switchToHttp().getRequest();
        req.tenantManager = manager;

        return await next.handle().toPromise();
      }),
    );
  }
}
