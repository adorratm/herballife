const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
  };

  console.log('Connecting as', config.user, 'to', config.database, '@', config.host);

  const client = new Client(config);
  await client.connect();
  console.log('Connected');

  await client.query('DROP SCHEMA IF EXISTS public CASCADE');
  await client.query('CREATE SCHEMA public');
  await client.query('GRANT ALL ON SCHEMA public TO PUBLIC');
  console.log('Schema reset OK');

  await client.end();
}

main().catch((err) => {
  console.error('ERR', err.message);
  process.exit(1);
});
