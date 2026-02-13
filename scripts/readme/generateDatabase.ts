import path from 'path';
import { PATHS, readFile, listFiles } from './utils';

export async function generateDatabase(lang: string, t: any): Promise<string> {
  let out = `## ${t.sections.database[lang]}\n\n`;
  const schemaFiles = await listFiles(PATHS.schemas);
  if (schemaFiles.length === 0) {
    out += '_No schema found_\n';
  } else {
    for (const file of schemaFiles.filter(f => f.endsWith('.ts'))) {
      const content = await readFile(path.join(PATHS.schemas, file));
      // Extraction des tables
      const tableRegex = /export const (\w+)\s*=\s*pgTable\(\s*['"](\w+)['"],([\s\S]*?)(?=\n\s*\)\s*[;,])/g;
      let match;
      let foundTable = false;
      while ((match = tableRegex.exec(content))) {
        if (!foundTable) {
          out += `- **${file}**\n`;
          foundTable = true;
        }
        out += `  - Table _${match[2]}_ (const _${match[1]}_)\n`;
        // Extraction du bloc de champs (avant la première parenthèse fermante ou callback)
        let fieldsBlock = match[3];
        if (fieldsBlock.includes('},') || fieldsBlock.includes('}\n')) {
          fieldsBlock = fieldsBlock.split(/},?\s*\n?/)[0] + '}';
        }
        // Extrait les lignes de champs du bloc { ... }
        const fieldLines = fieldsBlock.match(/\{([\s\S]*?)\}/);
        if (fieldLines && fieldLines[1]) {
          const fields = fieldLines[1].split(/,\s*\n|,\s*$/).map(l => l.trim()).filter(Boolean);
          for (const f of fields) {
            // Extrait le nom et le type du champ
            const fieldMatch = f.match(/(\w+):\s*([a-zA-Z0-9_]+)/);
            if (fieldMatch && fieldMatch[1] && fieldMatch[2]) {
              out += `    - Champ : _${fieldMatch[1]}_ \`(${fieldMatch[2]})\`\n`;
            } else {
              // fallback si le type n'est pas détecté
              const nameOnly = f.match(/(\w+):/);
              if (nameOnly && nameOnly[1]) {
                out += `    - Champ : _${nameOnly[1]}_\n`;
              }
            }
          }
        }
      }
      // Extraction des relations exportées (optionnel)
      const relRegex = /export const (\w+Relations)\s*=\s*relations\((\w+),\s*\(\{\s*(one|many)\s*\}\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g;
      let relMatch;
      let foundRel = false;
      while ((relMatch = relRegex.exec(content))) {
        if (!foundRel) {
          out += `  - Relations :\n`;
          foundRel = true;
        }
        const relBlock = relMatch[4];
        const singleRel = /([a-zA-Z0-9_]+):\s*(one|many)\((\w+)(?:,\s*\{[^}]*\})?\)/g;
        let subMatch;
        while ((subMatch = singleRel.exec(relBlock))) {
          out += `    - _${subMatch[1]}_ : \`${subMatch[2]}\` vers _${subMatch[3]}_\n`;
        }
      }
    }
  }
  return out;
}
