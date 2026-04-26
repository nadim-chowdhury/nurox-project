import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('RLSUtility');

/**
 * Enables Row Level Security (RLS) on a table and adds the isolation policy.
 */
export async function enableRLSOnTable(
  dataSource: DataSource,
  tableName: string,
  schema: string = 'public',
) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const fullTableName = `"${schema}"."${tableName}"`;

  try {
    logger.log(`Enabling RLS on ${fullTableName}...`);

    // 1. Enable RLS
    await queryRunner.query(
      `ALTER TABLE ${fullTableName} ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE ${fullTableName} FORCE ROW LEVEL SECURITY`,
    );

    // 2. Drop existing policy if any
    await queryRunner.query(
      `DROP POLICY IF EXISTS tenant_isolation_policy ON ${fullTableName}`,
    );

    // 3. Create Isolation Policy
    // Policy ensures that rows are only visible if tenant_id matches the session variable
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON ${fullTableName}
      USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid)
    `);

    logger.log(`RLS Policy applied to ${fullTableName}`);
  } catch (error) {
    logger.error(`Failed to enable RLS on ${fullTableName}: ${error.message}`);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Disables RLS on a table.
 */
export async function disableRLSOnTable(
  dataSource: DataSource,
  tableName: string,
  schema: string = 'public',
) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const fullTableName = `"${schema}"."${tableName}"`;
  try {
    await queryRunner.query(
      `ALTER TABLE ${fullTableName} DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS tenant_isolation_policy ON ${fullTableName}`,
    );
  } finally {
    await queryRunner.release();
  }
}
