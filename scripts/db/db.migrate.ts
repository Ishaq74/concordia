import { config } from "dotenv";
import path from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import { getPgClient } from "../../src/database/drizzle";

type MigrationRecord = { id: string; sql: string };

const MIGRATIONS_DIR = path.resolve(process.cwd(), "src/database/migrations");
const USE_PROD_DB = process.env.USE_PROD_DB === "true";
const CONNECTION_LABEL = USE_PROD_DB ? "production" : "local/dev";

config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const client = getPgClient();

  try {
    // Couleurs ANSI
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const cyan = '\x1b[36m';
    const bold = '\x1b[1m';
    const reset = '\x1b[0m';

    console.log(`\n${cyan}${bold}═══════════════════════════════════════════════════════${reset}`);
    console.log(`${cyan}${bold}   🚀 Migration Drizzle - Connexion ${CONNECTION_LABEL} 🚀${reset}`);
    console.log(`${cyan}${bold}═══════════════════════════════════════════════════════${reset}\n`);
    await client.connect();
    await ensureMigrationsTable(client);

    const applied = await loadAppliedMigrations(client);
    const pending = collectMigrations(applied);

    if (pending.length === 0) {
      if (!existsSync(MIGRATIONS_DIR)) {
        console.log(`\n${yellow}${bold}⚠️  Dossier de migrations introuvable.${reset}`);
        console.log(`${cyan}Aucune migration à appliquer car le dossier de migrations n'existe pas.${reset}`);
        console.log(`\n${bold}Pour activer les migrations, créez le dossier suivant :${reset}`);
        console.log(`${cyan}src/lib/database/migrations${reset}`);
        console.log(`\n${bold}Ajoutez vos schémas et générez des migrations avec :${reset} ${cyan}npm run db:generate${reset}\n`);
      } else {
        const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
        if (files.length === 0) {
          console.log(`\n${yellow}${bold}⚠️  Dossier de migrations vide.${reset}`);
          console.log(`${cyan}Aucune migration à appliquer car aucune migration n'a été générée.${reset}`);
          console.log(`\n${bold}Créez des schémas et générez des migrations avec :${reset} ${cyan}npm run db:generate${reset}\n`);
        } else {
          console.log(`\n${yellow}${bold}✔️  Aucune migration à appliquer.${reset}`);
          console.log(`${cyan}Toutes les migrations sont déjà appliquées.${reset}`);
        }
      }
      console.log(`\n${cyan}${bold}═══════════════════════════════════════════════════════${reset}\n`);
      return;
    }

    for (const migration of pending) {
      console.log(`\n${green}${bold}[migrate] → ${migration.id}${reset}`);
      // Découpe le SQL en commandes individuelles (attention aux points-virgules dans les fonctions !)
      const statements = migration.sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      let allOk = true;
      for (const stmt of statements) {
        if (!stmt) continue;
        try {
          await client.query('BEGIN');
          await client.query(stmt);
          await client.query('COMMIT');
        } catch (error: any) {
          await client.query('ROLLBACK');
          if (error?.code === '42P07' || error?.code === '42710' || error?.code === '42701') {
            console.warn(`${yellow}[migrate] ⚠️  Ignoré : ${error.message}${reset}`);
          } else {
            allOk = false;
            console.error(`${yellow}[migrate] ❌ Erreur : ${error.message}${reset}`);
            throw error;
          }
        }
      }
      if (allOk) {
        await client.query(
          "INSERT INTO __drizzle_migrations (id, hash, created_at) VALUES ($1, '', NOW()) ON CONFLICT (id) DO NOTHING",
          [migration.id],
        );
      }
    }
    console.log(`\n${green}${bold}✔️  Toutes les migrations ont été appliquées (en ignorant les objets déjà existants).${reset}\n`);
    console.log(`${cyan}${bold}═══════════════════════════════════════════════════════${reset}\n`);
  } finally {
    await client.end();
  }
}

function collectMigrations(applied: Set<string>): MigrationRecord[] {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.warn(`[migrate] Dossier migrations introuvable: ${MIGRATIONS_DIR}`);
    return [];
  }

  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => ({
      id: file.replace('.sql', ''),
      sql: readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'),
    }))
    .filter((migration) => !applied.has(migration.id));
}

async function ensureMigrationsTable(client: ReturnType<typeof getPgClient>) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id text PRIMARY KEY,
      hash text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function loadAppliedMigrations(client: ReturnType<typeof getPgClient>) {
  try {
    const result = await client.query<{ id: string }>(
      'SELECT id FROM __drizzle_migrations ORDER BY created_at ASC'
    );
    return new Set(result.rows.map((row) => row.id));
  } catch (error: any) {
    if (error?.code === '42P01') {
      return new Set<string>();
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("[migrate] Echec lors de l'application des migrations:", error);
  process.exit(1);
});