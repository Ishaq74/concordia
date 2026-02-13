import { Config, Report } from 'sonda';
import { readdirSync } from 'fs';
import { resolve } from 'path';

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true, encoding: 'utf8' });
  const files = [];
  for (const ent of entries) {
    const full = resolve(dir, ent.name);
    if (ent.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

async function main() {
  const input = process.argv[2] || './dist';
  const outputDir = process.argv[3] || './reports';
  const config = new Config({ outputDir, filename: 'sonda-report', open: false }, { integration: 'cli' });
  const report = new Report(config);

  const files = walk(resolve(process.cwd(), input));
  if (!files.length) {
    console.error('No files found in', input);
    process.exit(1);
  }

  for (const f of files) {
    report.addAsset(f);
  }

  const paths = await report.generate();
  for (const p of paths) console.log('Report generated:', p);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
