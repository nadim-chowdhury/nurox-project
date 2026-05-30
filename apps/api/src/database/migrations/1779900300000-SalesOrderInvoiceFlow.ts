import { MigrationInterface, QueryRunner } from 'typeorm';

export class SalesOrderInvoiceFlow1779900300000 implements MigrationInterface {
  name = 'SalesOrderInvoiceFlow1779900300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "subTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "vatTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "sdTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "taxTotal" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "totalAmount" numeric(14,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "financeInvoiceId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD COLUMN IF NOT EXISTS "mushak63Id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "taxBin" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "billingAddress" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN IF EXISTS "billingAddress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN IF EXISTS "taxBin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "mushak63Id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "financeInvoiceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "totalAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "taxTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "sdTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "vatTotal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP COLUMN IF EXISTS "subTotal"`,
    );
  }
}
