#!/usr/bin/env node
// scripts/i18n-doc-pages.mjs
// Adds i18n translations to all docs pages mechanically

import fs from 'fs';
import path from 'path';

const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// Map: relative path (without .astro) → translation key in t.docs.pages
const KEY_MAP = {
  'design/alert': 'alert',
  'design/badge': 'badge',
  'design/button': 'button',
  // card already done manually
  'design/code': 'code',
  'design/dialog': 'dialog',
  'design/dropdown': 'dropdown',
  'design/form': 'form',
  'design/kbd': 'kbd',
  'design/link': 'link',
  'design/menudropdown': 'menudropdown',
  'design/sheet': 'sheet',
  'design/switch': 'switch',
  'design/table': 'table',
  'design/tabs': 'tabs',
  'design/tooltip': 'tooltip',
  'design/video': 'video',
  'components/accordion': 'accordion',
  'components/avatar': 'avatar',
  'components/breadcrumb': 'breadcrumb',
  'components/gallery': 'gallery',
  'components/pagination': 'pagination',
  'components/progressbar': 'progressbar',
  'components/skeleton': 'skeleton',
  'components/slider': 'slider',
  'components/timeline': 'timeline',
  'layouts/base': 'baseLayout',
  'layouts/doc': 'docLayout',
  'templates/footer': 'footerTemplate',
  'templates/header': 'headerTemplate',
  'templates/table-of-contents': 'tocTemplate',
};

// h2 heading text → replacement expression
// Keys sorted longest-first to avoid substring matches
const HEADING_MAP = new Map([
  ['🎮 Interactive Demo', '{d.interactiveDemo ?? "🎮 Interactive Demo"}'],
  ['🎮 Démo interactive', '{d.interactiveDemo ?? "🎮 Démo interactive"}'],
  ['Interactive Demo', '{d.interactiveDemo ?? "Interactive Demo"}'],
  ['Démo interactive', '{d.interactiveDemo ?? "Démo interactive"}'],
  ['Stripes and animations', '{d.stripes ?? "Stripes and animations"}'],
  ['Rayures et animations', '{d.stripes ?? "Rayures et animations"}'],
  ['Utilisation avancée', '{d.advanced ?? "Utilisation avancée"}'],
  ['Utilisation basique', '{d.basicUsage ?? "Utilisation basique"}'],
  ['Utilisation de base', '{d.basicUsage ?? "Utilisation de base"}'],
  ['Advanced usage', '{d.advanced ?? "Advanced usage"}'],
  ['Advanced Usage', '{d.advanced ?? "Advanced Usage"}'],
  ['Usage avancé', '{d.advanced ?? "Usage avancé"}'],
  ['Best practices', '{d.bestPractices ?? "Best practices"}'],
  ['Bonnes pratiques', '{d.bestPractices ?? "Bonnes pratiques"}'],
  ['Disabled state', '{d.disabledState ?? "Disabled state"}'],
  ['État désactivé', '{d.disabledState ?? "État désactivé"}'],
  ['API Reference', '{d.apiReference ?? "API Reference"}'],
  ['Référence API', '{d.apiReference ?? "Référence API"}'],
  ["Cas d'utilisation", "{d.useCases ?? \"Cas d'utilisation\"}"],
  ['Installation', '{d.installation ?? "Installation"}'],
  ['Basic usage', '{d.basicUsage ?? "Basic usage"}'],
  ['Basic Usage', '{d.basicUsage ?? "Basic Usage"}'],
  ['Accessibility', '{d.accessibility ?? "Accessibility"}'],
  ['Accessibilité', '{d.accessibility ?? "Accessibilité"}'],
  ['Customization', '{d.customization ?? "Customization"}'],
  ['Personnalisation', '{d.customization ?? "Personnalisation"}'],
  ['With icons', '{d.withIcons ?? "With icons"}'],
  ['Avec icônes', '{d.withIcons ?? "Avec icônes"}'],
  ['Use cases', '{d.useCases ?? "Use cases"}'],
  ['Mode sombre', '{d.darkMode ?? "Dark mode"}'],
  ['Dark mode', '{d.darkMode ?? "Dark mode"}'],
  ['Variants', '{d.variants ?? "Variants"}'],
  ['Variantes', '{d.variants ?? "Variantes"}'],
  ['Examples', '{d.examples ?? "Examples"}'],
  ['Exemples', '{d.examples ?? "Exemples"}'],
  ['Positions', '{d.positions ?? "Positions"}'],
  ['Shortcuts', '{d.shortcuts ?? "Shortcuts"}'],
  ['Raccourcis', '{d.shortcuts ?? "Raccourcis"}'],
  ['Separators', '{d.separators ?? "Separators"}'],
  ['Séparateurs', '{d.separators ?? "Séparateurs"}'],
  ['Subtitles', '{d.subtitles ?? "Subtitles"}'],
  ['Sous-titres', '{d.subtitles ?? "Sous-titres"}'],
  ['Advanced', '{d.advanced ?? "Advanced"}'],
  ['Avancé', '{d.advanced ?? "Avancé"}'],
  ['Playback', '{d.playback ?? "Playback"}'],
  ['Lecture', '{d.playback ?? "Lecture"}'],
  ['Symbols', '{d.symbols ?? "Symbols"}'],
  ['Symboles', '{d.symbols ?? "Symboles"}'],
  ['Couleurs', '{d.colors ?? "Couleurs"}'],
  ['Colors', '{d.colors ?? "Colors"}'],
  ['Tailles', '{d.sizes ?? "Tailles"}'],
  ['Sizes', '{d.sizes ?? "Sizes"}'],
  ['Icônes', '{d.icons ?? "Icônes"}'],
  ['Icons', '{d.icons ?? "Icons"}'],
  ['Shapes', '{d.shapes ?? "Shapes"}'],
  ['Formes', '{d.shapes ?? "Formes"}'],
  ['Labels', '{d.labels ?? "Labels"}'],
  ['States', '{d.states ?? "States"}'],
  ['États', '{d.states ?? "États"}'],
  ['Themes', '{d.themes ?? "Themes"}'],
  ['Thèmes', '{d.themes ?? "Thèmes"}'],
  ['Stripes', '{d.stripes ?? "Stripes"}'],
  ['Rayures', '{d.stripes ?? "Rayures"}'],
  ['Types', '{d.types ?? "Types"}'],
  ['Props', '{d.props ?? "Props"}'],
  ['Usage', '{d.usage ?? "Usage"}'],
]);

// Props table header replacements
const TABLE_HEADERS = {
  'Prop': '{d.prop ?? "Prop"}',
  'Type': '{d.type ?? "Type"}',
  'Default': '{d.default ?? "Default"}',
  'Défaut': '{d.default ?? "Défaut"}',
  'Description': '{d.description ?? "Description"}',
};

let stats = { processed: 0, skipped: 0, errors: 0 };

function processFile(relPath) {
  const fullPath = path.join(DOCS_BASE, relPath + '.astro');
  const key = KEY_MAP[relPath];
  
  if (!key) {
    console.log(`  ⚠️  No key mapping for ${relPath}, skipping`);
    stats.skipped++;
    return;
  }

  if (!fs.existsSync(fullPath)) {
    console.log(`  ❌ File not found: ${fullPath}`);
    stats.errors++;
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already has i18n
  if (content.includes('getTranslations')) {
    console.log(`  ⏩ ${relPath} already has i18n`);
    stats.skipped++;
    return;
  }

  // ──────────────────────────────────────────────────────────
  // 1. Add import + variables in frontmatter
  // ──────────────────────────────────────────────────────────
  content = content.replace(
    'const lang = Astro.params.lang as string;',
    `import { getTranslations } from "@i18n/translations";
const lang = Astro.params.lang as string;
const t = getTranslations(lang);
const d = t.docs?.common ?? {};
const p = t.docs?.pages?.${key} ?? {};`
  );

  // ──────────────────────────────────────────────────────────
  // 2. Replace DocLayout title and description attributes
  // ──────────────────────────────────────────────────────────
  content = content.replace(
    /(<DocLayout\s[^>]*?)title="([^"]+)"/s,
    (match, prefix, oldTitle) => {
      const escaped = oldTitle.replace(/"/g, '\\"');
      return `${prefix}title={p.title ?? "${escaped}"}`;
    }
  );
  content = content.replace(
    /(<DocLayout\s[^>]*?)description="([^"]+)"/s,
    (match, prefix, oldDesc) => {
      const escaped = oldDesc.replace(/"/g, '\\"');
      return `${prefix}description={p.description ?? "${escaped}"}`;
    }
  );

  // ──────────────────────────────────────────────────────────
  // 3. Replace first <h1 ...>TEXT</h1>
  // ──────────────────────────────────────────────────────────
  let h1Replaced = false;
  content = content.replace(
    /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/,
    (match, open, text, close) => {
      h1Replaced = true;
      const trimmed = text.trim().replace(/"/g, '\\"');
      return `${open}{p.title ?? "${trimmed}"}${close}`;
    }
  );

  // ──────────────────────────────────────────────────────────
  // 4. Replace intro paragraph (first <p> after </h1>)
  // ──────────────────────────────────────────────────────────
  const h1EndIdx = content.indexOf('</h1>');
  if (h1EndIdx > -1) {
    const before = content.substring(0, h1EndIdx + 5);
    const after = content.substring(h1EndIdx + 5);
    
    // Match first <p>...</p> or <p ...>...</p> after h1
    const introMatch = after.match(/^(\s*)<p(\s[^>]*)?>(\s*)([\s\S]*?)\s*<\/p>/);
    if (introMatch) {
      const ws = introMatch[1];
      const innerText = introMatch[4].trim()
        .replace(/\n\s*/g, ' ')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
      const replacement = `${ws}<p set:html={p.intro ?? \`${innerText}\`} />`;
      content = before + after.replace(introMatch[0], replacement);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 5. Replace section headings (h2)
  // ──────────────────────────────────────────────────────────
  for (const [text, expr] of HEADING_MAP) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(<h2[^>]*>)\\s*${escaped}\\s*(<\\/h2>)`, 'g');
    content = content.replace(regex, `$1${expr}$2`);
  }

  // ──────────────────────────────────────────────────────────
  // 6. Replace props table headers: <TableHead>X</TableHead>
  // ──────────────────────────────────────────────────────────
  for (const [text, expr] of Object.entries(TABLE_HEADERS)) {
    const regex = new RegExp(`(<TableHead>)${text}(<\\/TableHead>)`, 'g');
    content = content.replace(regex, `$1${expr}$2`);
  }

  // ──────────────────────────────────────────────────────────
  // 7. Replace TableOfContents title prop
  // ──────────────────────────────────────────────────────────
  content = content.replace(
    /title="Table of contents"/g,
    'title={d.tableOfContents ?? "Table of contents"}'
  );
  content = content.replace(
    /title="Table des matières"/g,
    'title={d.tableOfContents ?? "Table des matières"}'
  );
  content = content.replace(
    /title="Sur cette page"/g,
    'title={d.tableOfContents ?? "Sur cette page"}'
  );

  // ──────────────────────────────────────────────────────────
  // 8. Fix common issues: </Card> → </CardComponent> etc.
  // ──────────────────────────────────────────────────────────
  // Only fix if CardComponent is imported but </Card> is used as closing tag
  if (content.includes('CardComponent') && content.includes('</Card>')) {
    // Replace </Card> only when it's a closing tag (not inside Code blocks)
    // Only replace if not inside a code={`...`} block
    content = content.replace(/(<\/Card>)(?![^`]*`\s*\})/g, (match, tag, offset) => {
      // Check if we're inside a code={``} block
      const before = content.substring(Math.max(0, offset - 200), offset);
      if (before.includes('code={`') && !before.includes('`}')) {
        return match; // inside code block, don't replace
      }
      return '</CardComponent>';
    });
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ ${relPath} → t.docs.pages.${key}`);
  stats.processed++;
}

// ─── MAIN ────────────────────────────────────────────────────
console.log('🔄 i18n Doc Pages Transformation\n');

for (const relPath of Object.keys(KEY_MAP)) {
  processFile(relPath);
}

console.log(`\n📊 Summary: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.errors} errors`);
