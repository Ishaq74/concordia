#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const base = path.join('src','pages','[lang]','docs');
const files = [
  'design/alert','design/badge','design/button','design/card','design/code',
  'design/dialog','design/dropdown','design/form','design/kbd','design/link',
  'design/menudropdown','design/sheet','design/switch','design/table','design/tabs',
  'design/tooltip','design/video',
  'components/accordion','components/avatar','components/breadcrumb',
  'components/gallery','components/pagination','components/progressbar',
  'components/skeleton','components/slider','components/timeline',
  'layouts/base','layouts/doc',
  'templates/footer','templates/header','templates/table-of-contents'
];

function isTypeOrDefault(text) {
  text = text.trim();
  if (text.length <= 1) return true;
  // Pure type names
  if (/^(string|boolean|number|object|ReactNode|HTMLElement|function|any|void|undefined|null)$/i.test(text)) return true;
  // Array types
  if (/\[\]$/.test(text)) return true;
  // Enum types (contains |)
  if (/\|/.test(text)) return true;
  // Default values: -, —, false, true, single words in quotes
  if (/^[-—]$/.test(text)) return true;
  if (/^(false|true)$/i.test(text)) return true;
  // Single code words (no spaces, lowercase or camelCase)
  if (/^"?[a-zA-Z0-9._-]+"?$/.test(text) && !text.includes(' ')) return true;
  // Pure numbers
  if (/^\d+/.test(text)) return true;
  // ShikiTransformer etc
  if (text.includes('Shiki') || text.includes('Astro') || text.includes('HTML')) return true;
  return false;
}

let descRemaining = 0;
for (const rel of files) {
  const fp = path.join(base, rel+'.astro');
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  // TableCell
  const tcMatches = [...c.matchAll(/<TableCell>([^{<][^<]*)<\/TableCell>/g)];
  // td for table
  const tdMatches = rel === 'design/table' ? [...c.matchAll(/<td>([^{<][^<]*)<\/td>/g)] : [];
  const all = [...tcMatches, ...tdMatches];
  const descs = all.filter(m => !isTypeOrDefault(m[1]));
  if (descs.length > 0) {
    descRemaining += descs.length;
    console.log(`${rel}: ${descs.length}`);
    descs.forEach(m => console.log(`  "${m[1].substring(0, 80)}"`));
  }
}
console.log(`\nTotal remaining descriptions: ${descRemaining}`);
