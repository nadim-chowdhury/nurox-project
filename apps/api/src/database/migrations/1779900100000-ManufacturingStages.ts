import { MigrationInterface, QueryRunner } from 'typeorm';

export class ManufacturingStages1779900100000 implements MigrationInterface {
  name = 'ManufacturingStages1779900100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."machines_status_enum" AS ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "machines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "workcenterId" uuid NOT NULL,
        "code" character varying(50) NOT NULL,
        "name" character varying(100) NOT NULL,
        "status" "public"."machines_status_enum" NOT NULL DEFAULT 'AVAILABLE',
        "capacityPerHour" numeric(12,4),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_machines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_machines_tenant_workcenter_code" UNIQUE ("tenant_id", "workcenterId", "code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_machines_tenant_id" ON "machines" ("tenant_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "FK_machines_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "FK_machines_workcenter" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."work_order_stages_status_enum" AS ENUM('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "work_order_stages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "workOrderId" uuid NOT NULL,
        "sequence" integer NOT NULL,
        "name" character varying(120) NOT NULL,
        "workcenterId" uuid NOT NULL,
        "machineId" uuid,
        "status" "public"."work_order_stages_status_enum" NOT NULL DEFAULT 'PENDING',
        "consumesBom" boolean NOT NULL DEFAULT false,
        "materialsConsumed" boolean NOT NULL DEFAULT false,
        "scheduledMinutes" integer NOT NULL DEFAULT 0,
        "plannedStartAt" TIMESTAMP WITH TIME ZONE,
        "plannedEndAt" TIMESTAMP WITH TIME ZONE,
        "actualStartAt" TIMESTAMP WITH TIME ZONE,
        "actualEndAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_work_order_stages" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_work_order_stages_tenant_wo_seq" UNIQUE ("tenant_id", "workOrderId", "sequence")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_work_order_stages_tenant_id" ON "work_order_stages" ("tenant_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_stages" ADD CONSTRAINT "FK_work_order_stages_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_stages" ADD CONSTRAINT "FK_work_order_stages_work_order" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_stages" ADD CONSTRAINT "FK_work_order_stages_workcenter" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_order_stages" ADD CONSTRAINT "FK_work_order_stages_machine" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(`ALTER TABLE "work_orders" ADD "warehouseId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP COLUMN "warehouseId"`,
    );
    await queryRunner.query(`DROP TABLE "work_order_stages"`);
    await queryRunner.query(
      `DROP TYPE "public"."work_order_stages_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "machines"`);
    await queryRunner.query(`DROP TYPE "public"."machines_status_enum"`);
  }
}
