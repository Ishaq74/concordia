
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs';
import dotenv from 'dotenv';

// Couleurs ANSI
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

// Vérification existence dossier et fichier schéma
const schemaDir = path.resolve(process.cwd(), 'src', 'database');
const schemaFile = path.resolve(schemaDir, 'schemas.ts');
const schemasFolder = path.resolve(schemaDir, 'schemas');
if (!fs.existsSync(schemaDir)) {
  console.error(`${yellow}${bold}[ERREUR]${reset} Dossier de schémas introuvable : ${schemaDir}`);
  process.exit(1);
}
if (!fs.existsSync(schemaFile)) {
  console.error(`${yellow}${bold}[ERREUR]${reset} Fichier de schéma introuvable : ${schemaFile}`);
  process.exit(1);
}
const schemaContent = fs.readFileSync(schemaFile, 'utf8').trim();
if (!schemaContent) {
  console.error(`${yellow}${bold}[ERREUR]${reset} Le fichier de schéma est vide : ${schemaFile}`);
  process.exit(1);
}
if (!fs.existsSync(schemasFolder)) {
  console.error(`${yellow}${bold}[ERREUR]${reset} Dossier de schémas introuvable : ${schemasFolder}`);
  process.exit(1);
}
const schemasFiles = fs.readdirSync(schemasFolder).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
if (schemasFiles.length === 0) {
  console.error(`${yellow}${bold}[ERREUR]${reset} Aucun fichier de schéma trouvé dans : ${schemasFolder}`);
  process.exit(1);
}

// Mode interactif : propose d'ajouter les fichiers non importés dans schemas.ts
const schemasFilesSet = new Set(schemasFiles.map(f => f.replace(/\.(ts|js)$/, '')));
const schemasTsContent = fs.readFileSync(schemaFile, 'utf8');
const imported = Array.from(schemasFilesSet).filter(name => new RegExp(`['\"\`]\.\/schemas\/${name}['\"\`]`).test(schemasTsContent));
const notImported = Array.from(schemasFilesSet).filter(name => !imported.includes(name));

async function promptAddImports(notImported: string[]) {
  const readline = await import('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    console.log(`\n${yellow}${bold}[INTERACTIF]${reset} Certains fichiers ne sont pas importés dans schemas.ts :`);
    notImported.forEach((f, i) => {
      console.log(`  [${i + 1}] ${f}.ts`);
    });
    rl.question(`Voulez-vous ajouter des imports à schemas.ts ? (ex: 1,2 ou rien pour ignorer) : `, (answer) => {
      rl.close();
      const selected = answer.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(i => i >= 0 && i < notImported.length);
      resolve(selected.map(i => notImported[i]));
    });
  });
}

async function maybeAddImports() {
  if (notImported.length === 0) return;
  const toAdd = await promptAddImports(notImported) as string[];
  if (toAdd.length === 0) {
    console.warn(`${yellow}${bold}[AVERTISSEMENT]${reset} Aucun import ajouté. Fichiers non importés :`);
    notImported.forEach((f: string) => console.warn(`  - ${f}.ts`));
    return;
  }
  let content = fs.readFileSync(schemaFile, 'utf8');
  // Supprime les lignes 'export {};'
  content = content.replace(/^export \{\};?\s*$/gm, '');
  let lastImportIdx = -1;
  const importRegex = /^import .* from .+;$/gm;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIdx = match.index + match[0].length;
  }
  let toInsert = '';
  (toAdd as string[]).forEach((f: string) => {
    toInsert += `export * from './schemas/${f}';\n`;
  });
  if (lastImportIdx >= 0) {
    content = content.slice(0, lastImportIdx) + '\n' + toInsert + content.slice(lastImportIdx);
  } else {
    content = toInsert + '\n' + content;
  }
  fs.writeFileSync(schemaFile, content, 'utf8');
  console.log(`${green}${bold}[OK]${reset} Exports ajoutés à schemas.ts :`);
  (toAdd as string[]).forEach((f: string) => console.log(`  - ${f}.ts`));
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });
    proc.on('exit', (code) => {
      if (code === 0) resolve(); else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
    proc.on('error', reject);
  });
}


(async () => {
  // Charge .env ou .env.example
  let envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env.example');
  }
  dotenv.config({ path: envPath });


  // UX : propose d'ajouter les imports manquants
  await maybeAddImports();


  // Création auto du dossier migrations/meta et du fichier _journal.json si besoin
  const migrationsMetaDir = path.resolve(process.cwd(), 'src', 'database', 'migrations', 'meta');
  const journalFile = path.join(migrationsMetaDir, '_journal.json');
  let createdMeta = false;
  if (!fs.existsSync(migrationsMetaDir)) {
    fs.mkdirSync(migrationsMetaDir, { recursive: true });
    createdMeta = true;
  }
  if (!fs.existsSync(journalFile)) {
    fs.writeFileSync(journalFile, '{"entries":[]}', 'utf8');
    createdMeta = true;
  }
  if (createdMeta) {
    console.log(`${green}${bold}[OK]${reset} Dossier migrations/meta et/ou _journal.json créés automatiquement.`);
  }

  // --- Détection des migrations AVANT génération ---
  const drizzleMigrationsDir = path.resolve(process.cwd(), 'drizzle', 'migrations');
  const srcMigrationsDir = path.resolve(process.cwd(), 'src', 'database', 'migrations');
  function listSqlFiles(dir: string): string[] {
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.sql')) : [];
  }
  const beforeDrizzle = listSqlFiles(drizzleMigrationsDir);
  const beforeSrc = listSqlFiles(srcMigrationsDir);
  const beforeSet = new Set([...beforeDrizzle.map(f=>`drizzle/${f}`), ...beforeSrc.map(f=>`src/${f}`)]);

  const useProd = process.env.USE_PROD_DB === 'true';
  const configPath = useProd
    ? path.resolve(process.cwd(), 'drizzle-prod.config.ts')
    : path.resolve(process.cwd(), 'drizzle-dev.config.ts');
  console.log(`${cyan}${bold}[génération] Fichier de config utilisé :${reset} ${configPath} (USE_PROD_DB=${process.env.USE_PROD_DB})`);
  process.env.DRIZZLE_CONFIG_PATH = configPath;

  await run('npx', ['drizzle-kit', 'generate', '--config', configPath]);

  // --- Détection des migrations APRÈS génération ---
  const afterDrizzle = listSqlFiles(drizzleMigrationsDir);
  const afterSrc = listSqlFiles(srcMigrationsDir);
  const afterSet = new Set([...afterDrizzle.map(f=>`drizzle/${f}`), ...afterSrc.map(f=>`src/${f}`)]);
  // Nouveaux fichiers = présents après mais pas avant
  const newMigrations = Array.from(afterSet).filter(f => !beforeSet.has(f));

  if (newMigrations.length > 0) {
    console.log(`\n${green}${bold}Migrations générées.${reset}`);
    newMigrations.forEach(f => console.log(`${green}  ➜ ${f}.sql${reset}`));
    console.log(`${bold}Pour appliquer les migrations, lancez :${reset} ${cyan}npm run db:migrate${reset}\n`);
  } else {
    console.log(`\n${yellow}${bold}Aucune table détectée.${reset}`);
    console.log(`${cyan}Aucun changement de schéma, rien à migrer 😴${reset}`);
    console.log(`${bold}Pour créer ou modifier des tables, éditez vos schémas dans :${reset}`);
    console.log(`${cyan}src/database/schemas.ts${reset}`);
    console.log(`${cyan}src/database/schemas/${reset}`);
    console.log(`${bold}Puis relancez la génération avec :${reset} ${cyan}npm run db:generate${reset}`);
  }
})().catch((err) => {
  console.error(`${yellow}${bold}[génération] Échec :${reset}`, err);
  process.exit(1);
});




