import { PATHS, readFile } from '../readme/utils';
import fs from 'fs/promises';
import path from 'path';
import glob from 'fast-glob';

const AGENTS_DIR = path.resolve(PATHS.root, '.github/agents');

function extractPatterns(scopeSection: string): { pattern: string, comment: string }[] {
  const lines = scopeSection.split('\n');
  const patterns: { pattern: string, comment: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*-\s*([`'"]?)([^`'"]+)\1\s*—?\s*(.*)$/);
    if (match) {
      patterns.push({ pattern: match[2].trim(), comment: match[3].trim() });
    }
  }
  return patterns;
}

async function listFilesForPattern(pattern: string): Promise<string[]> {
  // Convert pattern to glob (remove leading ./ if present)
  let g = pattern.replace(/^\.?\//, '');
  // Remove trailing /** for folder listing
  if (g.endsWith('/**')) g = g.slice(0, -3) + '/**/*';
  if (g.endsWith('/*')) g = g + '*';
  // Use fast-glob relative to repo root
  return await glob(g, { cwd: PATHS.root, onlyFiles: false, dot: false, unique: true });
}

async function injectScope(agentPath: string) {
  const content = await readFile(agentPath);
  const scopeMatch = content.match(/(## DOCUMENTATION AND OPERATIONAL SCOPE[\s\S]*?)(?=\n## |\n---|$)/);
  if (!scopeMatch) {
    // Section absente, on ne touche pas au fichier, on sauvegarde l'ancien contenu
    await fs.writeFile(agentPath + '.bak', content, 'utf8');
    console.warn(`Section 'DOCUMENTATION AND OPERATIONAL SCOPE' introuvable dans ${agentPath}, sauvegarde en .bak`);
    return;
  }
  const scopeSection = scopeMatch[1];
  const patterns = extractPatterns(scopeSection);
  let newScope = '## DOCUMENTATION AND OPERATIONAL SCOPE\n\n';
  if (!patterns.length) {
    // Aucun pattern détecté, on ne supprime rien, on garde l'ancien contenu et on sauvegarde
    await fs.writeFile(agentPath + '.bak', content, 'utf8');
    console.warn(`Aucun pattern détecté dans ${agentPath}, sauvegarde en .bak, aucun changement.`);
    return;
  }
  for (const { pattern, comment } of patterns) {
    newScope += `- \`${pattern}\`${comment ? ' — ' + comment : ''}\n`;
    const files = await listFilesForPattern(pattern);
    if (files.length) {
      for (const f of files) {
        newScope += `    - ${f}\n`;
      }
    } else {
      newScope += `    - _introuvable_\n`;
    }
  }
  // Replace old scope section
  const updated = content.replace(/## DOCUMENTATION AND OPERATIONAL SCOPE[\s\S]*?(?=\n## |\n---|$)/, newScope.trim());
  await fs.writeFile(agentPath, updated, 'utf8');
  console.log(`Injected scope for ${path.basename(agentPath)}`);
}

async function main() {
  const files = await fs.readdir(AGENTS_DIR);
  for (const file of files) {
    if (!file.endsWith('.agent.md')) continue;
    await injectScope(path.join(AGENTS_DIR, file));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
