import { PATHS, readFile } from '../readme/utils';
import fs from 'fs/promises';
import path from 'path';

const AGENTS_DIR = path.resolve(PATHS.root, '.github/agents');
const OUTPUT_DIR = path.resolve(PATHS.root, 'contextai');

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const files = await fs.readdir(AGENTS_DIR);
  for (const file of files) {
    if (!file.endsWith('.agent.md')) continue;
    const agentName = file.replace('.agent.md', '');
    const content = await readFile(path.join(AGENTS_DIR, file));
    // Extract scope section (between ## DOCUMENTATION AND OPERATIONAL SCOPE and next --- or ##)
    const match = content.match(/## DOCUMENTATION AND OPERATIONAL SCOPE([\s\S]*?)(---|##|$)/);
    const scope = match ? match[1].trim() : '';
    const outPath = path.join(OUTPUT_DIR, `${agentName}.context.md`);
    await fs.writeFile(outPath, scope, 'utf8');
    console.log(`Generated context for ${agentName}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
