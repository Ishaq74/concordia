import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PATHS = {
  root: path.resolve(__dirname, '../../'),
  schemas: path.resolve(__dirname, '../../src/database/schemas'),
  packageJson: path.resolve(__dirname, '../../package.json'),
  envExample: path.resolve(__dirname, '../../.env.example'),
  tsconfig: path.resolve(__dirname, '../../tsconfig.json'),
};

export async function listTree(dir: string, depth = 0): Promise<string> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let result = '';
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const indent = '  '.repeat(depth);
      if (entry.isDirectory()) {
        result += `${indent}- **${entry.name}**\n`;
        result += await listTree(path.join(dir, entry.name), depth + 1);
      } else {
        result += `${indent}- ${entry.name}\n`;
      }
    }
    return result;
  } catch {
    return '';
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

export async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isFile()).map(e => e.name);
  } catch {
    return [];
  }
}
