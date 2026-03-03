/**
 * fix-quote-errors.mjs — Fix unescaped quotes in i18n fallback strings
 */
import { readFileSync, writeFileSync } from 'fs';

const fixes = [
  {
    file: 'src/pages/[lang]/docs/components/accordion.astro',
    search: /descGroupNameSingle \?\? "Group name to share "single" mode"\}/,
    replace: 'descGroupNameSingle ?? `Group name to share "single" mode`}'
  },
  {
    file: 'src/pages/[lang]/docs/components/skeleton.astro',
    search: /descSkWidth \?\? "Custom width \(e\.g\. "200px", "50%"\)"\}/,
    replace: 'descSkWidth ?? `Custom width (e.g. "200px", "50%")`}'
  },
  {
    file: 'src/pages/[lang]/docs/components/skeleton.astro',
    search: /descSkHeight \?\? "Custom height \(e\.g\. "20px", "3rem"\)"\}/,
    replace: 'descSkHeight ?? `Custom height (e.g. "20px", "3rem")`}'
  },
  {
    file: 'src/pages/[lang]/docs/design/card.astro',
    search: /descAspectRatio \?\? "CSS aspect-ratio \(e\.g\. "16\/9"\)"\}/,
    replace: 'descAspectRatio ?? `CSS aspect-ratio (e.g. "16/9")`}'
  },
  {
    file: 'src/pages/[lang]/docs/design/link.astro',
    search: /descBtnTypeIfTag \?\? "Button type \(if tag="button"\)"\}/,
    replace: 'descBtnTypeIfTag ?? `Button type (if tag="button")`}'
  }
];

let total = 0;
for (const f of fixes) {
  let content = readFileSync(f.file, 'utf8');
  if (f.search.test(content)) {
    content = content.replace(f.search, f.replace);
    writeFileSync(f.file, content, 'utf8');
    total++;
    console.log(`✅ Fixed: ${f.file}`);
  } else {
    console.log(`⚠️  Not found: ${f.file}`);
  }
}
console.log(`\nTotal fixed: ${total}`);
