import { Injectable, Scope, Inject, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataSource, EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TenantConnectionService {
  private readonly logger = new Logger(TenantConnectionService.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly defaultDataSource: DataSource,
  ) {}

  /**
   * Retrieves the Tenant ID embedded in the request object by the TenantMiddleware.
   */
  get tenantId(): string {
    const tId = (this.request as Request & { tenantId?: string }).tenantId;
    if (!tId) {
      throw new Error(
        'Tenant ID not found in Request. Make sure TenantMiddleware is applied to this route.',
      );
    }
    return tId;
  }

  /**
   * Runs a database operation within a tenant-scoped transaction context.
   * This ensures the search_path is correctly set (for schema-per-tenant)
   * OR app.current_tenant_id is set (for row-level isolation).
   */
  async runInTenantContext<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.defaultDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // 1. Set Row-Level Security Context (Default)
      // This works even if the tenant has their own schema, as long as RLS is enabled on tables.
      await queryRunner.query(`SET app.current_tenant_id = '${this.tenantId}'`);

      // 2. Switch search_path (Optional/Enterprise)
      // If we determine this tenant uses a separate schema, we set the search_path.
      // For now, we'll try to use the tenantId as schema name if it's not a UUID,
      // but in the future this should be based on a flag in the Tenant entity.
      const tenant = (this.request as any).tenant;
      if (tenant?.schemaNamespace && tenant.schemaNamespace !== 'public') {
        await queryRunner.query(
          `SET search_path TO "${tenant.schemaNamespace}", "public"`,
        );
      }

      return await work(queryRunner.manager);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error executing in tenant context (${this.tenantId}): ${errorMessage}`,
      );
      throw error;
    } finally {
      // Always release the query runner to the pool
      await queryRunner.release();
    }
  }

  /**
   * Returns a TypeORM EntityManager execution wrapper securely scoped to the tenant.
   */
  async getTenantManager(): Promise<EntityManager> {
    const queryRunner = this.defaultDataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query(`SET app.current_tenant_id = '${this.tenantId}'`);

    const tenant = (this.request as any).tenant;
    if (tenant?.schemaNamespace && tenant.schemaNamespace !== 'public') {
      await queryRunner.query(
        `SET search_path TO "${tenant.schemaNamespace}", "public"`,
      );
    }

    return queryRunner.manager;
  }
}
