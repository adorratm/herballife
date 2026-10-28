import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CartItemSelectionLabel1761600000000 implements MigrationInterface {
  name = 'CartItemSelectionLabel1761600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cart_items"
      ADD COLUMN IF NOT EXISTS "selection_label" character varying(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cart_items" DROP COLUMN IF EXISTS "selection_label"
    `);
  }
}
