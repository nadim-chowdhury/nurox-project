import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { enableRLSOnTable } from '../../database/rls.utility';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const isDev = this.config.get('app.nodeEnv') !== 'production';
    const shouldSync = this.config.get('database.synchronize');

    // In development with synchronize enabled, we re-apply RLS on startup
    if (isDev && shouldSync) {
      await this.applyRLSToAllTenantEntities();
    }
  }

  async applyRLSToAllTenantEntities() {
    this.logger.log('Scanning entities for RLS enablement...');
    const metadatas = this.dataSource.entityMetadatas;
    
    for (const metadata of metadatas) {
      // Check if entity extends TenantBaseEntity
      // We check the prototype chain
      let parent = Object.getPrototypeOf(metadata.target);
      let isTenantScoped = false;
      
      while (parent && parent.name) {
        if (parent.name === 'TenantBaseEntity') {
          isTenantScoped = true;
          break;
        }
        parent = Object.getPrototypeOf(parent);
      }

      if (isTenantScoped) {
        try {
          await enableRLSOnTable(this.dataSource, metadata.tableName, metadata.schema);
        } catch (error) {
          this.logger.error(`Failed to enable RLS on ${metadata.tableName}: ${error.message}`);
        }
      }
    }
    this.logger.log('RLS enablement scan complete.');
  }
}
