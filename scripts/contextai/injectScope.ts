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
  const lines = content.split('\n');
  let inScope = false;
  let scopeStart = -1;
  let scopeEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## DOCUMENTATION AND OPERATIONAL SCOPE')) {
      inScope = true;
      scopeStart = i;
      continue;
    }
    if (inScope && (lines[i].startsWith('## ') || lines[i].startsWith('---'))) {
      scopeEnd = i;
      break;
    }
  }
  if (!inScope) return;
  if (scopeEnd === -1) scopeEnd = lines.length;
  const scopeLines = lines.slice(scopeStart + 1, scopeEnd);
  // Find patterns and inject under each
  let newScopeLines = [];
  let i = 0;
  const seenPatterns = new Set();
  while (i < scopeLines.length) {
    const match = scopeLines[i].match(/^(\s*)-\s*([`'\"]?)([^`'\"]+)\2\s*—?\s*(.*)$/);
    if (match) {
      const indent = match[1] || '';
      const pattern = match[3].trim();
      // Ignore duplicate or malformed patterns
      if (seenPatterns.has(pattern) || !pattern) {
        newScopeLines.push(scopeLines[i]);
        i++;
        continue;
      }
      seenPatterns.add(pattern);
      newScopeLines.push(scopeLines[i]);
      // Skip any existing injected file list
      let j = i + 1;
      while (j < scopeLines.length && /^\s{4,}- /.test(scopeLines[j])) j++;
      // Inject fresh file list
      let files = await listFilesForPattern(pattern);
      files = Array.from(new Set(files)).sort();
      if (files.length) {
        for (const f of files) newScopeLines.push(`${indent}    - ${f}`);
      } else {
        newScopeLines.push(`${indent}    - _introuvable_`);
      }
      i = j;
    } else {
      newScopeLines.push(scopeLines[i]);
      i++;
    }
  }
  // Replace only the scope section
  const newLines = [
    ...lines.slice(0, scopeStart + 1),
    ...newScopeLines,
    ...lines.slice(scopeEnd)
  ];
  await fs.writeFile(agentPath, newLines.join('\n'), 'utf8');
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
