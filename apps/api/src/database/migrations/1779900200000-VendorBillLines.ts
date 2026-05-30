import { MigrationInterface, QueryRunner } from 'typeorm';

export class VendorBillLines1779900200000 implements MigrationInterface {
  name = 'VendorBillLines1779900200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "subTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "vatTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "sdTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "taxTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "financeBillId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD COLUMN IF NOT EXISTS "notes" text`,
    );

    await queryRunner.query(`
      CREATE TABLE "vendor_bill_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "vendorBillId" uuid NOT NULL,
        "productId" uuid,
        "poLineId" uuid,
        "description" character varying(255) NOT NULL,
        "quantity" numeric(12,4) NOT NULL,
        "unitCost" numeric(12,4) NOT NULL,
        "lineSubtotal" numeric(14,2) NOT NULL,
        "vatRate" numeric(5,2) NOT NULL DEFAULT 15,
        "sdRate" numeric(5,2) NOT NULL DEFAULT 0,
        "vatAmount" numeric(14,2) NOT NULL DEFAULT 0,
        "sdAmount" numeric(14,2) NOT NULL DEFAULT 0,
        "lineTaxTotal" numeric(14,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_bill_lines" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_bill_lines_tenant_id" ON "vendor_bill_lines" ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_bill_lines_tenant_created" ON "vendor_bill_lines" ("tenant_id", "createdAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bill_lines" ADD CONSTRAINT "FK_vendor_bill_lines_bill" FOREIGN KEY ("vendorBillId") REFERENCES "vendor_bills"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_vendor_bills_tenant_bill_number" ON "vendor_bills" ("tenant_id", "billNumber")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_vendor_bills_tenant_bill_number"`,
    );
    await queryRunner.query(`DROP TABLE "vendor_bill_lines"`);
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "financeBillId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "taxTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "sdTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "vatTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP COLUMN IF EXISTS "subTotal"`,
    );
  }
}
