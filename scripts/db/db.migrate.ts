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

        // Affiche la DB cible (masquée) et avertissement PROD si nécessaire
        const targetDbUrl = USE_PROD_DB ? (process.env.DATABASE_URL_PROD || process.env.DATABASE_URL) : (process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL);
        const maskUrl = (u?: string) => u ? u.replace(/:\/\/[^@]+@/, '://***@') : 'N/A';
        const dbNameFromUrl = (u?: string) => {
          try { return u ? new URL(u).pathname.replace(/^\//, '') : 'unknown'; } catch { return (u || '').split('/').pop() || 'unknown'; }
        };
        console.log(`${yellow}${bold}Cible DB:${reset} ${maskUrl(targetDbUrl)} (${CONNECTION_LABEL})`);
        if (USE_PROD_DB) {
          console.log(`\n\x1b[41m\x1b[97m PROD ATTENTION !! Vous ciblez la base de production : ${dbNameFromUrl(targetDbUrl)} \x1b[0m\n`);
          if (process.env.CONFIRM_PROD !== 'oui') {
            const readline = await import('node:readline/promises');
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const answer = await rl.question('Êtes-vous sûr de vouloir exécuter les migrations sur PROD ? (oui/non): ');
            rl.close();
            if (answer.trim().toLowerCase() !== 'oui') {
              console.log('Opération annulée (confirmation PROD manquante).');
              process.exit(0);
            }
          } else {
            console.log(`${yellow}[SECURE] CONFIRM_PROD=oui détecté — exécution sur PROD autorisée.${reset}`);
          }
        }

    // Connexion au client PostgreSQL (restaurée — avait été supprimée par erreur)
    console.log(`${cyan}Connexion au client PostgreSQL...${reset}`);
    await client.connect();

    // --- Nouveau: gère le flag --reset -------------------------------------------------
    const doReset = process.argv.includes('--reset');
    if (doReset) {
      console.log(`\n\x1b[41m\x1b[97m ATTENTION DESTRUCTIF: --reset demandé — toutes les tables de la base ${dbNameFromUrl(targetDbUrl)} vont être SUPPRIMÉES ! \x1b[0m\n`);

      // Si on est en production on exige CONFIRM_PROD=oui ou une confirmation explicite
      if (USE_PROD_DB && process.env.CONFIRM_PROD !== 'oui') {
        const readline = await import('node:readline/promises');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await rl.question('CONFIRM_PROD requis pour --reset sur PROD. Tapez "oui" pour confirmer: ');
        rl.close();
        if (answer.trim().toLowerCase() !== 'oui') {
          console.log('Opération annulée (confirmation manquante).');
          process.exit(0);
        }
      } else {
        // Non-PROD: demande une confirmation explicite (protection contre erreur humaine)
        const readline = await import('node:readline/promises');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await rl.question('Ce flag va supprimer toutes les tables et réinitialiser l\'historique des migrations. Confirmer (oui/non) ? ');
        rl.close();
        if (answer.trim().toLowerCase() !== 'oui') {
          console.log('Opération annulée (annulation par utilisateur).');
          process.exit(0);
        }
      }

      console.log(`${yellow}Suppression des tables en cours...${reset}`);
      // Désactive temporairement les contraintes pour éviter les erreurs de dépendance
      await client.query('SET session_replication_role = replica;');
      const { rows: tables } = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
      for (const { tablename } of tables) {
        try {
          await client.query(`DROP TABLE IF EXISTS "${tablename}" CASCADE;`);
          console.log(`${green}Table supprimée: ${tablename}${reset}`);
        } catch (err: any) {
          console.warn(`${yellow}Échec suppression table ${tablename}: ${err?.message || err}${reset}`);
        }
      }
      await client.query('SET session_replication_role = DEFAULT;');
      console.log(`${green}Toutes les tables supprimées.${reset}\n`);
    }
    // --- fin -- nouveau ---------------------------------------------------------------

    await ensureMigrationsTable(client);

    const applied = await loadAppliedMigrations(client);
    const pending = collectMigrations(applied);

    if (pending.length === 0) {
      // Message clair et visible dans tous les cas (évite l'impression incomplète de la sortie)
      console.log(`\n${green}${bold}✔️  Aucun changement — aucune migration en attente pour la base ${dbNameFromUrl(targetDbUrl)} (${CONNECTION_LABEL}).${reset}`);

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
      const statements = migration.sql
        .split(/\s*-->\s*statement-breakpoint\s*/)
        .map(statement => statement.trim())
        .filter(Boolean);

      await client.query('BEGIN');
      try {
        for (const [index, stmt] of statements.entries()) {
          const savepoint = `migration_statement_${index}`;
          await client.query(`SAVEPOINT ${savepoint}`);
          try {
            await client.query(stmt);
            await client.query(`RELEASE SAVEPOINT ${savepoint}`);
          } catch (error: any) {
            await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
            if (error?.code === '42P07' || error?.code === '42710' || error?.code === '42701') {
              console.warn(`${yellow}[migrate] ⚠️  Ignoré : ${error.message}${reset}`);
              continue;
            }
            throw error;
          }
        }

        await client.query(
          "INSERT INTO __drizzle_migrations (id, hash, created_at) VALUES ($1, '', NOW()) ON CONFLICT (id) DO NOTHING",
          [migration.id],
        );
        await client.query('COMMIT');
      } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(`${yellow}[migrate] ❌ Erreur : ${error.message}${reset}`);
        throw error;
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