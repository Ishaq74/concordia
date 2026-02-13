import { promises as fs } from 'fs';
import path from 'path';
import { generateStructure } from './readme/generateStructure';
import { generateDatabase } from './readme/generateDatabase';
import { generateScripts } from './readme/generateScripts';
import { generateDeps, generateEnv, generateTsconfigAliases } from './readme/generateDeps';
import { generateStyles } from './readme/generateStyles';
import { githubSlug, getLangLinks } from './readme/helpers';
import { LANGS, i18n } from './readme/i18n';
import type { Lang } from './readme/i18n';

const currentDir = path.dirname(path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));



async function generateReadmeForLang(lang: Lang) {
  const t = i18n;
  let md = `# ${t.projectName[lang]}\n\n`;
  md += `${getLangLinks(lang)}\n\n`;
  md += `${t.description[lang]}\n\n`;
  md += `${t.subtitle[lang]}\n\n`;

  // Génère le contenu principal (hors sommaire)
  let mainContent = '';
  mainContent += `## ${t.sections.overview[lang]}\n\n`;
  mainContent += t.overview[lang] + '\n\n';

  mainContent += `## ${t.sections.features[lang]}\n\n`;
  mainContent += t.features[lang].join('\n') + '\n\n';

  mainContent += `## ${t.sections.techStack[lang]}\n\n`;
  mainContent += await generateDeps() + '\n\n';

  mainContent += `## ${t.sections.installation[lang]}\n\n`;
  mainContent += '```bash\n';
  mainContent += 'npm install\n';
  mainContent += await generateScripts();
  mainContent += '```\n\n';

  mainContent += await generateStructure(lang, t);

  mainContent += `### Alias TypeScript (tsconfig.json)\n\n`;
  mainContent += await generateTsconfigAliases() + '\n\n';

  mainContent += `## ${t.sections.auth[lang]}\n\n`;
  mainContent += t.auth[lang] + '\n\n';

  mainContent += await generateDatabase(lang, t);

  mainContent += `\n## ${t.sections.env[lang]}\n\n`;
  mainContent += await generateEnv() + '\n';

  mainContent += `\n${await generateStyles(lang, t)}`;

  // Tests section
  try {
    const { generateTests } = await import('./readme/generateTests');
    mainContent += '\n' + await generateTests(lang, t) + '\n';
  } catch (err) {
    console.warn('generateTests import failed', err);
  }

  // Génère dynamiquement le sommaire à partir des titres ## du contenu
  const tocTitle = `## ${t.toc[lang]}\n\n`;
  const tocLines = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(mainContent))) {
    const title = match[1].trim();
    const anchor = githubSlug(title);
    tocLines.push(`- [${title}](#${anchor})`);
  }
  md += tocTitle + tocLines.join('\n') + '\n\n' + mainContent;

  // Collapse multiple consecutive blank lines to a single blank line (fix MD012)
  md = md.replace(/\n{3,}/g, '\n\n');

  // Ensure the generated markdown ends with a single newline (fix MD022 trailing newline issue)
  if (!md.endsWith('\n')) md += '\n';

  // Write file
  const suffix = lang === 'en' ? '' : `.${lang}`;
  const filePath = path.resolve(currentDir, `../README${suffix}.md`);
  await fs.writeFile(filePath, md, 'utf8');
  console.log(`✅ README${suffix}.md generated`);
}

async function main() {
  for (const lang of LANGS) {
    await generateReadmeForLang(lang);
  }
}

main().catch(console.error);
