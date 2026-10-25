/**
 * Ürün/kategori/blog/kampanya çevirilerini DB’de yeniler (tam seed olmadan).
 * Kullanım: yarn migrate:i18n
 */
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { migrateI18nContent } from './migrate-i18n-content';
import { migrateCmsI18n } from './migrate-cms-i18n';

async function main() {
  await AppDataSource.initialize();
  try {
    await AppDataSource.transaction(async (em) => {
      await migrateI18nContent(em);
      await migrateCmsI18n(em);
    });
    console.log('migrate:i18n tamamlandı');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
