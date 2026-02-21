import { listFiles, readFile, PATHS } from './utils';
import path from 'path';
import { i18n, LANGS, type Lang } from './i18n';

/**
 * Generates the Database section for the README.
 * Lists all tables from exported schema files (barrel file = source of truth),
 * and provides a bonus list of schema files present but not exported.
 * Strictly uses utils.ts for all file operations.
 */
export async function generateDatabaseSection(lang: Lang = 'en') {
  // Barrel file path
  const barrelPath = path.join(PATHS.schemas, '..', 'schemas.ts');
  // List all schema files in directory
  const schemaFiles = (await listFiles(PATHS.schemas)).filter(f => f.endsWith('.ts'));
  // Read barrel file content
  const barrelContent = await readFile(barrelPath);
  // Extract exported schema file bases from barrel file
  // Handles: export * from './schemas/FILENAME';
  // Match export * from './schemas/ANYTHING'; (with or without .schema, .ts, quotes)
  const exportRegex = /export\s*\*\s*from\s*['"]\.\/schemas\/([\w.-]+)['"]/g;
  const exportedFiles: string[] = [];
  let match;
  while ((match = exportRegex.exec(barrelContent)) !== null) {
    let file = match[1];
    if (!file.endsWith('.ts')) file += '.ts';
    exportedFiles.push(file);
  }
  // DEBUG: Output all schema files and exported files with their normalized names
  console.log('--- DEBUG: Schema files in directory ---');
  for (const f of schemaFiles) {
    console.log(`  ${f} => ${f.replace(/\.schema/, '').replace(/\.ts$/, '').replace(/[-_]/g, '').toLowerCase()}`);
  }
  console.log('--- DEBUG: Barrel exported files ---');
  for (const f of exportedFiles) {
    console.log(`  ${f} => ${f.replace(/\.schema/, '').replace(/\.ts$/, '').replace(/[-_]/g, '').toLowerCase()}`);
  }
  console.log('--- DEBUG: Real exported files after normalization ---');

  while ((match = exportRegex.exec(barrelContent)) !== null) {
    exportedFiles.push(match[1]);
  }

  // Robust normalization: remove .ts, .schema, replace dashes/underscores, lowercase
  const normalize = (f: string) => f.replace(/\.schema/, '').replace(/\.ts$/, '').replace(/[-_]/g, '').toLowerCase();
  const schemaMap = new Map<string, string>();
  for (const f of schemaFiles) schemaMap.set(normalize(f), f);
  const exportedMap = new Map<string, string>();
  for (const f of exportedFiles) exportedMap.set(normalize(f), f);

  // Files exported in barrel and present in directory (by normalized name)
  const realExportedFiles = [];
  for (const [norm, file] of exportedMap.entries()) {
    if (schemaMap.has(norm)) realExportedFiles.push(schemaMap.get(norm)!);
  }

  // Bonus: files present but not exported (by normalized name)
  const bonusFiles = schemaFiles.filter(f => !exportedMap.has(normalize(f)));

  // Extract table definitions, fields, and relations from exported schema files
  const exportedTables = [];
  for (const file of realExportedFiles) {
    const filePath = path.join(PATHS.schemas, file);
    const content = await readFile(filePath);
    // Extract all exported relations blocks matching the Drizzle pattern
    const allRelations = [];
    // Matches: export const blogPostsRelations = relations(blogPosts, ({ many }) => ({ ... }));
    const relExportRegex = /export\s+const\s+(\w+)Relations\s*=\s*relations\(\s*(\w+)\s*,[^=]*=>\s*\((\{[\s\S]*?\})\)\s*\);/gm;
    let relMatch;
    let foundAny = false;
    while ((relMatch = relExportRegex.exec(content)) !== null) {
      foundAny = true;
      // (debug output removed)
      const relBody = relMatch[3];
      const relFieldRegex = /([a-zA-Z0-9_]+)\s*:\s*(one|many)\s*\(/g;
      const rels = [];
      let relFieldMatch;
      while ((relFieldMatch = relFieldRegex.exec(relBody)) !== null) {
        rels.push({
          name: relFieldMatch[1],
          type: relFieldMatch[2],
        });
      }
      allRelations.push({
        exportedName: relMatch[1],
        tableVar: relMatch[2],
        relations: rels,
      });
    }
    // (debug output removed)
    // Match: export const TABLE = pgTable('table_name', { ... }) or const TABLE = pgTable(...)
    const tableRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*pgTable\(\s*['"]([\w_\-]+)['"]\s*,\s*\{([\s\S]*?)\}\s*[,)]/g;
    let tableMatch: RegExpExecArray | null;
    while ((tableMatch = tableRegex.exec(content)) !== null) {
      // Extract fields from the object literal
      const fieldsBlock = tableMatch[3];
      // Match lines like: fieldName: type(...)
      const fieldRegex = /([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*\(/g;
      const fields = [];
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
        });
      }
      // Find relations for this table by constName
      const relObj = allRelations.find(r => r.tableVar === tableMatch![1]);
      const relations = relObj ? relObj.relations : [];
      exportedTables.push({
        file,
        constName: tableMatch[1],
        tableName: tableMatch[2],
        fields,
        relations,
      });
    }
    }

  // i18n titles/messages
  const dbTitle = i18n.sections.database?.[lang] || i18n.sections.database.en;
  const exportedTitle = i18n.databaseExportedTitle?.[lang] || i18n.databaseExportedTitle.en;
  const bonusTitle = i18n.databaseBonusTitle?.[lang] || i18n.databaseBonusTitle.en;
  const noExported = i18n.databaseNoExported?.[lang] || i18n.databaseNoExported.en;
  const noFields = i18n.databaseNoFields?.[lang] || i18n.databaseNoFields.en;
  const noTables = i18n.databaseNoTables?.[lang] || i18n.databaseNoTables.en;
  const allExported = i18n.databaseAllExported?.[lang] || i18n.databaseAllExported.en;

  let section = `## ${dbTitle}\n\n`;
  section += `### ${exportedTitle}\n\n`;
  if (realExportedFiles.length === 0) {
    section += noExported + '\n';
  } else {
    // Group by file
    const grouped: Record<string, any[]> = {};
    for (const t of exportedTables) {
      if (!grouped[t.file]) grouped[t.file] = [];
      grouped[t.file].push(t);
    }
    for (const file of realExportedFiles) {
      section += `- **${file}**\n`;
      if (grouped[file]) {
        for (const table of grouped[file]) {
          section += `  - ${table.tableName} (const: ${table.constName})\n`;
          if (table.fields && table.fields.length > 0) {
            for (const field of table.fields) {
              section += `    - ${field.name}: ${field.type}\n`;
            }
          } else {
            section += `    - ${noFields}\n`;
          }
          if (table.relations && table.relations.length > 0) {
            section += `    - Relations:\n`;
            for (const rel of table.relations) {
              section += `      - ${rel.name}: ${rel.type}\n`;
            }
          }
        }
      } else {
        section += `  ${noTables}\n`;
      }
    }
  }

  section += `\n### ${bonusTitle}\n\n`;
  if (bonusFiles.length === 0) {
    section += allExported + '\n';
  } else {
    for (const file of bonusFiles) {
      section += `- ${file}\n`;
    }
  }

  return section;
}

export async function generateDatabase(lang: Lang = 'en') {
  return await generateDatabaseSection(lang);
}