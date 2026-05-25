import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';

@Processor('recycle-bin')
export class RecycleBinProcessor extends WorkerHost {
  private readonly logger = new Logger(RecycleBinProcessor.name);

  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Starting recycle bin purge job ${job.id}`);

    try {
      // Find all tables that have a deleted_at column
      const tablesQuery = `
        SELECT table_schema, table_name 
        FROM information_schema.columns 
        WHERE column_name = 'deleted_at' 
          AND table_schema NOT IN ('information_schema', 'pg_catalog');
      `;

      const tables: { table_schema: string; table_name: string }[] =
        await this.dataSource.query(tablesQuery);

      let totalPurged = 0;

      for (const table of tables) {
        const fullTableName = `"${table.table_schema}"."${table.table_name}"`;

        // Delete records where deleted_at is older than 30 days
        const deleteQuery = `
          DELETE FROM ${fullTableName}
          WHERE deleted_at < NOW() - INTERVAL '30 days';
        `;

        const [, affectedRows] = await this.dataSource.query(deleteQuery);
        if (affectedRows > 0) {
          this.logger.log(
            `Purged ${affectedRows} records from ${fullTableName}`,
          );
          totalPurged += affectedRows;
        }
      }

      this.logger.log(
        `Recycle bin purge complete. Total records purged: ${totalPurged}`,
      );
      return { totalPurged };
    } catch (error) {
      this.logger.error(`Recycle bin purge failed: ${error.message}`);
      throw error;
    }
  }
}
