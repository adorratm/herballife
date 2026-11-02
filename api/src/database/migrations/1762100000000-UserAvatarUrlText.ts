import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Google OAuth avatar URL’leri varchar(500)’e sığmıyordu */
export class UserAvatarUrlText1762100000000 implements MigrationInterface {
  name = 'UserAvatarUrlText1762100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "avatar_url" TYPE text
      USING "avatar_url"::text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "avatar_url" TYPE character varying(500)
      USING LEFT("avatar_url", 500)
    `);
  }
}
