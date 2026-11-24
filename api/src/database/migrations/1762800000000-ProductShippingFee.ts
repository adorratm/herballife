import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Ürün bazlı kargo ücreti — sabit sağlayıcı/ücret yerine */
export class ProductShippingFee1762800000000 implements MigrationInterface {
  name = 'ProductShippingFee1762800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "shipping_fee" numeric(12,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "shipping_fee"
    `);
  }
}
