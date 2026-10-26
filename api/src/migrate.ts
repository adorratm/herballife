import 'reflect-metadata';
import { AppDataSource } from '@database/data-source';
import { ALL_MIGRATIONS } from '@database/migrations';

async function assertCoreTables(ds: typeof AppDataSource) {
  const rows: Array<{ table_name: string }> = await ds.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [['categories', 'products', 'users']],
  );
  const found = new Set(rows.map((r) => r.table_name));
  const missing = ['categories', 'products', 'users'].filter((t) => !found.has(t));
  if (missing.length > 0) {
    throw new Error(
      `[migrate] Core tables missing after migrations: ${missing.join(', ')}. ` +
        'ALL_MIGRATIONS boş veya InitialSchema uygulanamadı.',
    );
  }
}

async function run() {
  console.log('[migrate] Connecting…');
  if (ALL_MIGRATIONS.length === 0) {
    throw new Error(
      '[migrate] ALL_MIGRATIONS boş — şema oluşturulamaz. InitialSchema ekleyin.',
    );
  }
  const ds = await AppDataSource.initialize();
  try {
    console.log('[migrate] Running pending migrations…');
    const applied = await ds.runMigrations({ transaction: 'each' });
    if (applied.length === 0) {
      console.log('[migrate] No pending migrations.');
    } else {
      console.log(`[migrate] Applied ${applied.length} migration(s):`);
      for (const m of applied) {
        console.log(`  - ${m.name}`);
      }
    }
    await assertCoreTables(ds);
    console.log('[migrate] Core tables OK (categories, products, users).');
  } finally {
    await ds.destroy();
  }
  console.log('[migrate] Done.');
}

run().catch((err) => {
  console.error('[migrate] FAILED:', err);
  process.exit(1);
});
