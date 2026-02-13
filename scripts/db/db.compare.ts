import { config } from 'dotenv';
import { Client } from 'pg';

// Pour la couleur en console
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

config();

const urlLocal = process.env.DATABASE_URL_LOCAL;
const urlProd = process.env.DATABASE_URL_PROD;

if (!urlLocal || !urlProd) throw new Error('DATABASE_URL_LOCAL ou DATABASE_URL_PROD manquant');

function getClient(url: string) {
  return new Client({
    connectionString: url,
    ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });
}

async function checkConnection(label: string, url: string) {
  const client = getClient(url);
  try {
    await client.connect();
    const res = await client.query('SELECT current_database(), current_user, inet_server_addr() as host');
    console.log(green(`✔ Connexion OK [${label}]`), cyan(JSON.stringify(res.rows[0])));
    return client;
  } catch (e) {
    console.log(red(`✖ Connexion échouée [${label}]`), e);
    return null;
  }
}

async function getSchema(client: Client) {
  const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  const columns = await client.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, column_name`);
  return { tables: tables.rows, columns: columns.rows };
}

async function getData(client: Client, table: string) {
  try {
    // Utilise le nom de table passé en argument, sans hardcode
    const res = await client.query(`SELECT * FROM "${table}" ORDER BY id::text`);
    return res.rows;
  } catch (e: any) {
    if (e.code === '42P01') {
      // Table n'existe pas
      return null;
    }
    throw e;
  }
}

function diffRows(rowsA: any[], rowsB: any[]) {
  const aNotInB = rowsA.filter(a => !rowsB.some(b => JSON.stringify(a) === JSON.stringify(b)));
  const bNotInA = rowsB.filter(b => !rowsA.some(a => JSON.stringify(a) === JSON.stringify(b)));
  return { aNotInB, bNotInA };
}

async function compareSchemasAndData(clientA: Client, labelA: string, clientB: Client, labelB: string) {
  const schemaA = await getSchema(clientA);
  const schemaB = await getSchema(clientB);

  // Compare tables
  const tablesA = schemaA.tables.map(t => t.table_name);
  const tablesB = schemaB.tables.map(t => t.table_name);
  const onlyInA = tablesA.filter(t => !tablesB.includes(t));
  const onlyInB = tablesB.filter(t => !tablesA.includes(t));

  console.log(yellow(`\n---\nÉTAPE 1 : STRUCTURE DES TABLES`));
  console.log(yellow(`Tables uniquement dans ${labelA} (pas dans ${labelB}):`), onlyInA);
  console.log(yellow(`Tables uniquement dans ${labelB} (pas dans ${labelA}):`), onlyInB);

  // Compare columns
  function colKey(c: any) { return c.table_name + '.' + c.column_name + ':' + c.data_type; }
  const colsA = schemaA.columns.map(colKey);
  const colsB = schemaB.columns.map(colKey);
  const onlyColsA = colsA.filter(c => !colsB.includes(c));
  const onlyColsB = colsB.filter(c => !colsA.includes(c));

  console.log(yellow(`\n---\nÉTAPE 2 : STRUCTURE DES COLONNES`));
  console.log(yellow(`Colonnes uniquement dans ${labelA} (pas dans ${labelB}):`), onlyColsA);
  console.log(yellow(`Colonnes uniquement dans ${labelB} (pas dans ${labelA}):`), onlyColsB);

  // Compare data pour toutes les tables communes
  console.log(yellow(`\n---\nÉTAPE 3 : DONNÉES DES TABLES COMMUNES`));
  const commonTables = tablesA.filter(t => tablesB.includes(t));
  for (const table of commonTables) {
    const dataA = await getData(clientA, table);
    const dataB = await getData(clientB, table);
    if (dataA === null || dataB === null) {
      console.log(red(`❗ Table '${table}' absente dans l'une des bases, données non comparées.`));
    } else {
      const { aNotInB, bNotInA } = diffRows(dataA, dataB);
      if (aNotInB.length || bNotInA.length) {
        console.log(red(`❗ Différences de données dans la table '${table}':`));
        console.log(red(`- ${labelA} lignes différentes: ${aNotInB.length}`));
        console.log(red(`- ${labelB} lignes différentes: ${bNotInA.length}`));
        if (aNotInB.length <= 5) console.log(red(`- Présent dans ${labelA} mais pas dans ${labelB}:`), aNotInB);
        if (bNotInA.length <= 5) console.log(red(`- Présent dans ${labelB} mais pas dans ${labelA}:`), bNotInA);
        if (aNotInB.length > 5 || bNotInA.length > 5) console.log(yellow('⚠ Trop de différences, seules les 5 premières sont affichées.'));
      } else {
        console.log(green(`Aucune différence de données dans '${table}'.`));
      }
    }
  }

  // Étape 4: Validation contre le schéma Drizzle attendu
  console.log(yellow(`\n---\nÉTAPE 4 : VALIDATION CONTRE LE SCHÉMA DRIZZLE`));
  const EXPECTED_TABLES = [
    'user',
    'session',
    'account',
    'verification',
    'organization',
    'member',
    'invitation',
    'admin_role_definition',
  ];
  const setA = new Set(tablesA);
  const setB = new Set(tablesB);
  const missingA = EXPECTED_TABLES.filter(t => !setA.has(t));
  const missingB = EXPECTED_TABLES.filter(t => !setB.has(t));
  console.log(yellow(`Manquantes dans ${labelA}:`), missingA);
  console.log(yellow(`Manquantes dans ${labelB}:`), missingB);
  if (missingA.length === 0) console.log(green(`✔ ${labelA}: toutes les tables attendues sont présentes`));
  if (missingB.length === 0) console.log(green(`✔ ${labelB}: toutes les tables attendues sont présentes`));
}

(async () => {
  const clientLocal = await checkConnection('local', urlLocal);
  const clientProd = await checkConnection('prod', urlProd);
  if (!clientLocal || !clientProd) return;
  await compareSchemasAndData(clientLocal, 'local', clientProd, 'prod');
  await clientLocal.end();
  await clientProd.end();
})();