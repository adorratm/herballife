import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Sipariş kaleminde KDV oranı anlık görüntüsü */
export class OrderItemVatRate1762900000000 implements MigrationInterface {
  name = 'OrderItemVatRate1762900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "vat_rate" numeric(5,2) NULL
    `);
    await queryRunner.query(`
      UPDATE "order_items" oi
      SET "vat_rate" = p."vat_rate"
      FROM "products" p
      WHERE oi."product_id" = p."id"
        AND oi."vat_rate" IS NULL
        AND p."vat_rate" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
      DROP COLUMN IF EXISTS "vat_rate"
    `);
  }
}
