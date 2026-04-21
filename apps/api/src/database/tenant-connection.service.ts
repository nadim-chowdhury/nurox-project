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
   * This ensures the search_path is correctly set and the query runner is released.
   */
  async runInTenantContext<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.defaultDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Switch the active schema path securely for Postgres
      // We use double quotes for schema name to prevent SQL injection and handle special characters
      await queryRunner.query(
        `SET search_path TO "${this.tenantId}", "public"`,
      );

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
   * Returns a TypeORM EntityManager execution wrapper securely scoped to the tenant's exact Postgres Schema.
   * WARNING: The caller is responsible for releasing the underlying query runner if they use the manager directly.
   * Prefer using runInTenantContext for automatic lifecycle management.
   */
  async getTenantManager(): Promise<EntityManager> {
    const queryRunner = this.defaultDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.query(`SET search_path TO "${this.tenantId}", "public"`);
    return queryRunner.manager;
  }
}
