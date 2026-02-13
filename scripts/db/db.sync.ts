import { config } from 'dotenv';
import { Client } from 'pg';

config();

const USE_PROD_DB = process.env.USE_PROD_DB === 'true';
const urlLocal = process.env.DATABASE_URL_LOCAL;
const urlProd = process.env.DATABASE_URL_PROD;

if (!urlLocal || !urlProd) throw new Error('DATABASE_URL_LOCAL ou DATABASE_URL_PROD manquant');

function getClient(url: string) {
  return new Client({
    connectionString: url,
    ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });
}

async function copyTableData(from: Client, to: Client, table: string) {
  const { rows } = await from.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  await to.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  for (const row of rows) {
    const values = columns.map(col => row[col]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
    await to.query(
      `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      values
    );
  }
}

async function getTables(client: Client) {
  const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  return res.rows.map(r => r.table_name);
}

// direction: 'a-to-b' ou 'b-to-a' (A = USE_PROD_DB ? prod : local)
const direction = process.argv[2];
if (!['dev-to-prod', 'prod-to-dev'].includes(direction)) {
  console.error('Usage: npx tsx scripts/syncdb.ts dev-to-prod|prod-to-dev');
  process.exit(1);
}

(async () => {

  let from, to;
  if (direction === 'dev-to-prod') {
    from = getClient(urlLocal);
    to = getClient(urlProd);
    // Safety: confirmation prompt for dev to prod
    const readline = await import('node:readline/promises');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\x1b[33mATTENTION: Vous allez ÉCRASER la base de données PROD avec les données de DEV. Sauvegardez vos données avant de continuer !\x1b[0m');
    const answer = await rl.question('Êtes-vous sûr de vouloir continuer ? (oui/non): ');
    rl.close();
    if (answer.trim().toLowerCase() !== 'oui') {
      console.log('Opération annulée.');
      process.exit(0);
    }
  } else {
    from = getClient(urlProd);
    to = getClient(urlLocal);
  }

  await from.connect();
  await to.connect();
  const tables = await getTables(from);
  for (const table of tables) {
    console.log(`Sync table: ${table}`);
    await copyTableData(from, to, table);
  }
  await from.end();
  await to.end();
  console.log('Synchronisation terminée.');
})();