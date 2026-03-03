import fs from 'fs';
import path from 'path';

const dir = 'src/pages/[lang]/docs';

function walk(d) {
  const items = fs.readdirSync(d, { withFileTypes: true });
  let r = [];
  for (const i of items) {
    const p = path.join(d, i.name);
    if (i.isDirectory()) r = r.concat(walk(p));
    else if (i.name.endsWith('.astro')) r.push(p);
  }
  return r;
}

const files = walk(dir);
const headingsPerFile = {};
const allHeadings = new Set();

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const re = /<h([123])\s[^>]*id="([^"]+)"[^>]*>([^<]+)/g;
  let m;
  const pageHeadings = [];
  while ((m = re.exec(c)) !== null) {
    const [, level, id, text] = m;
    pageHeadings.push({ level: `h${level}`, id, text: text.trim() });
    allHeadings.add(id);
  }
  const relPath = f.replace(/\\/g, '/');
  headingsPerFile[relPath] = pageHeadings;
}

// Print per-file headings
for (const [file, headings] of Object.entries(headingsPerFile)) {
  console.log(`\n=== ${file} ===`);
  for (const h of headings) {
    console.log(`  ${h.level} #${h.id} -> "${h.text}"`);
  }
}

// Print all unique heading IDs
console.log('\n=== ALL UNIQUE IDs ===');
for (const id of [...allHeadings].sort()) {
  console.log(`  ${id}`);
}

console.log(`\n${files.length} files, ${allHeadings.size} unique heading IDs`);
