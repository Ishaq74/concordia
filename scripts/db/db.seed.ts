
import { config } from 'dotenv';
import { getPgClient } from '../../src/database/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
// Schema helper used to insert derived junction rows from blog_posts.categoryId
import { blogPostCategories } from '../../src/database/schemas';

config();

// Utilise USE_PROD_DB du .env pour choisir la base
const isProd = process.env.USE_PROD_DB === 'true';
process.env.DATABASE_URL = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_LOCAL;


async function seed() {
  const args = process.argv.slice(2);
  const doReset = args.includes('--reset');

  // Safety: show target DB and require confirmation when running against production
  if (isProd) {
    const prodUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;
    const mask = (u?: string) => u ? u.replace(/:\/\/[^@]+@/, '://***@') : 'N/A';
    const dbName = (() => { try { return new URL(prodUrl!).pathname.replace(/^\//, '') } catch { return (prodUrl || '').split('/').pop() || 'unknown' } })();
    console.log(`\x1b[41m\x1b[97m PROD ATTENTION !! Vous ciblez la base de production : ${dbName} (${mask(prodUrl)}) \x1b[0m`);
    if (process.env.CONFIRM_PROD !== 'oui') {
      const readline = await import('node:readline/promises');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question('CONFIRM_PROD requis pour seed sur PROD. Continuer ? (oui/non): ');
      rl.close();
      if (answer.trim().toLowerCase() !== 'oui') {
        console.log('Opération annulée.');
        process.exit(0);
      }
    } else {
      console.log('\x1b[33m[SECURE] CONFIRM_PROD=oui détecté — seed sur PROD autorisé.\x1b[0m');
    }
  }

  const client = getPgClient();
  await client.connect();
  const db = drizzle(client);

  if (doReset) {
    // Récupère la liste des tables dynamiquement
    const { rows: tables } = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
    // Désactive les contraintes FK
    await client.query('SET session_replication_role = replica;');
    for (const { tablename } of tables) {
      try {
        await client.query(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
        console.log(`[RESET] Table vidée: ${tablename}`);
      } catch (err) {
        console.error(`[ERR] Reset table ${tablename}:`, err);
      }
    }
    // Réactive les contraintes FK
    await client.query('SET session_replication_role = DEFAULT;');
    console.log('[RESET] Toutes les tables ont été vidées.');
  }

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

  const schemaDir = path.resolve(process.cwd(), 'src/database/schemas');
  const dataDir = path.resolve(process.cwd(), 'src/database/data');
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
      let rows = (dataset as any[]).map(transformRow);

      // Normalize / map known data key mismatches so schema insertions succeed
      if (baseName === 'blog_media') {
        rows = rows.map(r => {
          // schema expects `alt` (jsonb); some seed data used `altText`
          if (r.altText && !r.alt) {
            r.alt = r.altText;
            delete r.altText;
          }
          // ensure width/height are strings (schema stores text)
          if (r.width !== undefined) r.width = String(r.width);
          if (r.height !== undefined) r.height = String(r.height);
          // remove uploadDate if present (not in schema)
          if (r.uploadDate) delete r.uploadDate;
          return r;
        });
      }

      if (baseName === 'blog_organizations' || baseName === 'blog_organization') {
        rows = rows.map(r => {
          // schema has `name` (string); data provides `legalName` (localized object)
          if (!r.name && r.legalName) {
            r.name = r.legalName.fr || r.legalName.en || Object.values(r.legalName)[0] || r.slug || r.id;
          }
          // drop large/unused localized fields that schema doesn't expect
          if (r.legalName) delete r.legalName;
          if (r.address) delete r.address;
          if (r.sameAs) delete r.sameAs;
          if (r.foundingDate) delete r.foundingDate;
          return r;
        });
      }

      if (rows.length === 0) {
        console.log(`[INFO] Dataset vide pour ${baseName}`);
        continue;
      }

      const inserter: any = db.insert(chosenSchemaExport as any).values(rows as any);
      try {
        if (typeof inserter.onConflictDoNothing === 'function') {
          await inserter.onConflictDoNothing();
        } else {
          await inserter;
        }
        console.log(`[OK] ${baseName} -> ${chosenSchemaFile} (${rows.length} lignes)`);
      } catch (err) {
        // Log full error for debugging (include driver details)
        try { console.error(`[ERR-DETAILED] ${baseName}:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2)); } catch (e) { console.error('[ERR-DETAILED] could not stringify error', err); }
        throw err;
      }

      // --- Special-case: if blog_posts rows include `categoryId`, populate
      // the junction table `blog_post_categories` from those values so existing
      // (misnamed) data in blog_posts is respected instead of requiring a
      // separate blog_post_categories.data.ts file.
      if (baseName === 'blog_posts') {
        try {
          const rawDataset = (dataModule && Object.values(dataModule).find((d: any[]) => Array.isArray(d))) as any[];
          if (rawDataset && rawDataset.length) {
            const mapping = rawDataset
              .map(r => ({ postId: r.id, categoryId: r.categoryId }))
              .filter(x => x.postId && x.categoryId);
            if (mapping.length) {
              await db.insert(blogPostCategories).values(mapping).onConflictDoNothing();
              console.log(`[OK] blog_post_categories (derived from blog_posts.categoryId) -> ${mapping.length} lignes`);
            }
          }
        } catch (err) {
          console.warn('[WARN] Failed to derive blog_post_categories from blog_posts:', err);
        }
      }
    } catch (err) {
      if (err && err.message) {
        console.error(`[ERR] ${baseName}: ${err.message}`);
      } else {
        console.error(`[ERR] ${baseName}:`, err);
      }
    }
  }

  await client.end();
  console.log('Seed terminé pour toutes les tables');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });