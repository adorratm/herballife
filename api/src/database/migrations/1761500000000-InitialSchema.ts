import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * İlk şema: entity metadata → Postgres tabloları.
 * Sonraki değişiklikler için `yarn migration:generate` ile ayrı migration ekleyin.
 */
export class InitialSchema1761500000000 implements MigrationInterface {
  name = 'InitialSchema1761500000000';

  /** synchronize DDL’i transaction dışında daha güvenli */
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Boş DB bootstrap; mevcut tablolarda yalnızca eksikleri tamamlar.
    await queryRunner.connection.synchronize();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Bootstrap migration — geri alma desteklenmiyor (veri kaybı riski).
  }
}
