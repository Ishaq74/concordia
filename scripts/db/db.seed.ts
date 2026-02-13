import { config } from 'dotenv';
import { getPgClient } from '../../src/database/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

config();

// Utilise USE_PROD_DB du .env pour choisir la base
const isProd = process.env.USE_PROD_DB === 'true';
process.env.DATABASE_URL = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_LOCAL;

async function seed() {
  const client = getPgClient();
  await client.connect();
  const db = drizzle(client);

  function normalizeValue(v: any) {
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (Array.isArray(v)) return JSON.stringify(v);
    return v;
  }
  function transformRow(row: any) {
    const out: any = {};
    for (const k of Object.keys(row)) out[k] = normalizeValue(row[k]);
    return out;
  }

  const schemaDir = path.resolve(process.cwd(), 'src/lib/database/schemas');
  const dataDir = path.resolve(process.cwd(), 'src/lib/database/data');
  const schemaFiles = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts') && !f.startsWith('index'));
  const dataFiles = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.data.ts'))
    .sort(); // Assure l'ordre alphabétique (01, 02...)

  const normalize = (s: string) => s.toLowerCase().replace(/[_\-]/g, '');
  const toCamel = (s: string) => s.replace(/[_-](\w)/g, (_, c) => c.toUpperCase());

  for (const dataFile of dataFiles) {
    // On enlève le préfixe numérique éventuel (ex: 01-user.data.ts -> user)
    const baseName = dataFile.replace(/^\d+-/, '').replace('.data.ts', '');
    // 1) essaie de charger un fichier de schéma qui a le même basename
    let candidateSchemaFiles: string[] = [];
    const directMatch = schemaFiles.find(f => f.replace(/\.schema\.ts$/, '').replace(/\.ts$/, '') === baseName);
    if (directMatch) candidateSchemaFiles.push(directMatch);
    // 2) sinon, évalue tous les schémas (pour des cas comme siteidentity vs site_settings)
    if (candidateSchemaFiles.length === 0) candidateSchemaFiles = [...schemaFiles];

    let chosenSchemaExport: any | null = null;
    let chosenSchemaFile: string | null = null;

    for (const sf of candidateSchemaFiles) {
      try {
        const schemaURL = pathToFileURL(path.join(schemaDir, sf)).href;
        const schemaModule = await import(schemaURL);
        const exportKeys = Object.keys(schemaModule);
        const normBase = normalize(baseName);
        const camelBase = toCamel(baseName);

        // Règles de choix par priorité
        // a) export du même nom exact
        let key = exportKeys.find(k => k === baseName) || null;
        // b) export du nom camelCase
        if (!key) key = exportKeys.find(k => k === camelBase) || null;
        // c) export dont le nom normalisé est égal (pas de sous-chaîne pour éviter les faux positifs)
        if (!key) key = exportKeys.find(k => normalize(k) === normBase) || null;
        // d) si on est sur le fichier directMatch et qu'il n'a qu'un seul export, on l'utilise
        if (!key && sf === directMatch && exportKeys.length === 1) key = exportKeys[0];
        // pas de fallback aveugle pour éviter les mappages aléatoires

        if (key) {
          chosenSchemaExport = (schemaModule as any)[key];
          chosenSchemaFile = sf;
          break;
        }
      } catch (e) {
        // continue sur autre schéma si import échoue
      }
    }

    if (!chosenSchemaExport) {
      console.warn(`[SKIP] Schéma introuvable pour dataset ${baseName}`);
      continue;
    }

    try {
      const dataURL = pathToFileURL(path.join(dataDir, dataFile)).href;
      const dataModule = await import(dataURL);
      const dataset = Object.values(dataModule).find((d: any) => Array.isArray(d));
      if (!dataset) {
        console.warn(`[SKIP] Dataset tableau non trouvé pour ${dataFile}`);
        continue;
      }
      const rows = (dataset as any[]).map(transformRow);
      if (rows.length === 0) {
        console.log(`[INFO] Dataset vide pour ${baseName}`);
        continue;
      }
      const inserter: any = db.insert(chosenSchemaExport as any).values(rows as any);
      if (typeof inserter.onConflictDoNothing === 'function') {
        await inserter.onConflictDoNothing();
      } else {
        await inserter;
      }
      console.log(`[OK] ${baseName} -> ${chosenSchemaFile} (${rows.length} lignes)`);
    } catch (err) {
      console.error(`[ERR] ${baseName}:`, err);
    }
  }

  await client.end();
  console.log('Seed terminé pour toutes les tables');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });