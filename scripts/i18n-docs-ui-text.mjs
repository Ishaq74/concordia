/**
 * i18n-docs-ui-text.mjs — Phase 6
 * Comprehensive i18n of UI text in doc pages (best practices, accessibility, sub-component descriptions, features)
 * Skips demo/example content (names, prices, Data N, placeholder content)
 * 
 * Strategy:
 *  - Extract hardcoded UI text from <li>, <p> tags in doc .astro files
 *  - Skip demo content using heuristics (names, prices, short examples, visual variant descriptions)
 *  - Generate keys under docs.pages.{pageName}.ui{N}
 *  - Add FR text in fr.json, EN text in en.json, use EN for es/ar as baseline
 *  - Modify .astro files to use {p.uiN ?? "fallback"}
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const i18nDir = resolve(root, 'src/i18n');
const docBase = resolve(root, 'src/pages/[lang]/docs');

// ── Helper: detect if text is demo/example content (skip) ──────────────────
function isDemoContent(text) {
  const t = text.trim();
  // Too short (under 15 chars) unless it's a clear UI phrase
  if (t.length < 12) return true;
  
  // Names / demo data patterns
  if (/^(John|Jane|Bob|Alice|Charlie|Smith|Doe|Brown|Johnson)/i.test(t)) return true;
  if (/^(Company [A-Z]|Product \d|Data \d|Column \d|Step \d)/i.test(t)) return true;
  if (/^\d+[€$]|^\d+h$|^\d+\s*(min|px|rem|vw|vh)$/i.test(t)) return true;
  if (/^\d+[,.]?\d*\s*€/i.test(t)) return true;
  if (/^\$\d/i.test(t)) return true;
  if (/^@\{|^\$\{/.test(t)) return true; // template literals
  
  // Prices, currencies
  if (/^\d.*€\/month$/i.test(t)) return true;
  if (/^\d+am|^\d+pm/i.test(t)) return true;
  
  // Unicode separators, single emoji
  if (/^[›»•·—–]$/.test(t)) return true;
  if (/^[\u{1F000}-\u{1FFFF}]$/u.test(t)) return true;
  
  // Lorem ipsum
  if (/^lorem ipsum/i.test(t)) return true;
  
  // Pure placeholder content
  if (/^(first|second|third|fourth) tab content/i.test(t)) return true;
  if (/^content\.{2,}$/i.test(t)) return true;
  if (/^(your|contenu|votre)\s+(content|contenu|dialog)/i.test(t)) return true;
  if (/^contenu\b/i.test(t)) return true;
  
  // Visual variant descriptions (demo) - these describe how a variant LOOKS
  if (/^(retro|modern|futuristic|initial)\s+(style|design|variant|product|alternate)/i.test(t)) return true;
  if (/^(pixelated|neon|gradient|glassmorphism|diagonal|elegant)/i.test(t)) return true;
  
  // Dialog/sheet demo content
  if (/^dialog content with/i.test(t)) return true;
  if (/^(small|large|medium)\s+size\s+(dialog|sheet)/i.test(t)) return true;
  
  // Tab demo content 
  if (/^(manage your|configure your|control your|access all|browse your|view and manage|generate and download|explore|real-time|team management|deployment|artificial|neural|computer vision)/i.test(t)) return true;
  if (/^(welcome to|check your recent|dashboard with)/i.test(t)) return true;
  
  // Example text for component demos
  if (/^(hover me|open search|new file|select all|search all)/i.test(t)) return true;
  if (/^"?\{(testimonial|slogan)/i.test(t)) return true;
  if (/"\{testimonial/i.test(t)) return true;
  
  // Pagination examples
  if (/^(page \d|single page|siblingCount)/i.test(t)) return true;
  if (/^(start|middle|end) \(page/i.test(t)) return true;
  if (/^simple example with \d+ pages/i.test(t)) return true;
  
  // Accordion variant descriptions
  if (/^(rounded corners|animation via|square border|subtle background|cut angles|tightened)/i.test(t)) return true;
  if (/^open me to see/i.test(t)) return true;
  if (/^(this step|closes as soon|pure css|this item|the cursor)/i.test(t)) return true;
  
  // Short heading-like demo labels
  if (/^(primary|secondary|accent)\s+(retro|modern|futuristic)/i.test(t)) return true;
  if (/^(free plan|extra large|no shadow|light shadow|medium shadow|strong shadow|very strong shadow)/i.test(t)) return true;
  
  // Badge demo patterns
  if (/^(✅|❌|⚠️|✓|ℹ️)\s+/u.test(t)) return false; // feature lists with checkmarks are UI!
  
  // Code theme names
  if (/^github (dark|light)/i.test(t)) return true;
  
  // Form placeholder-style
  if (/^(john doe|cyberu|your message|describe|leave a comment|your notes)/i.test(t)) return true;
  
  // Card demo
  if (/min read|comments$/i.test(t)) return true;
  
  // Pricing 
  if (/\d+€\/month/i.test(t)) return true;
  
  return false;
}

// ── Helper: detect if text is genuinely UI text ────────────────────────────
function isUIText(text) {
  const t = text.trim();
  
  // Accessibility keywords
  if (/screen reader|aria|wcag|keyboard|focus|a11y|accessible|assistive/i.test(t)) return true;
  
  // Best practice patterns
  if (/^(use|avoid|prefer|always|keep|limit|combine|ensure|place|add a|disable)/i.test(t)) return true;
  
  // Feature list patterns (✓/✅ checkmarks)
  if (/^(✓|✅|☑)/u.test(t)) return true;
  
  // Technical description patterns
  if (/component|container|wrapper|slot|prop|attribute|element|layout|structure|template/i.test(t)) return true;
  if (/button|menu|link|input|checkbox|radio|toggle|switch|select|textarea|sidebar/i.test(t)) return true;
  
  // Design system common terms
  if (/variant|color|responsive|mobile|dark mode|animation|transition/i.test(t)) return true;
  
  // Documentation descriptions
  if (/automatically|supports|displays?|generates?|provides?|manages?|handles?|adapts?/i.test(t)) return true;
  
  // French UI terms
  if (/composant|structure|navigation|accessibilit|responsive|automatique/i.test(t)) return true;
  
  return false;
}

// ── Determine page name from file path ─────────────────────────────────────
function getPageName(filePath) {
  const name = basename(filePath, '.astro');
  const dir = basename(dirname(filePath));
  
  // Map to existing keys
  const mapping = {
    'components/accordion': 'accordion',
    'components/avatar': 'avatar', 
    'components/breadcrumb': 'breadcrumb',
    'components/gallery': 'gallery',
    'components/pagination': 'pagination',
    'components/skeleton': 'skeleton',
    'components/slider': 'slider',
    'components/timeline': 'timeline',
    'design/alert': 'alert',
    'design/badge': 'badge',
    'design/button': 'button',
    'design/card': 'card',
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
    'layouts/base': 'baseLayout',
    'layouts/doc': 'docLayout',
    'templates/footer': 'footer',
    'templates/header': 'header',
    'templates/table-of-contents': 'tableOfContents',
  };
  
  return mapping[`${dir}/${name}`] || name;
}

// ── French pages that need EN/ES/AR translations ───────────────────────────
const FRENCH_PAGES = new Set(['baseLayout', 'footer', 'header', 'sheet']);

// ── Common EN↔FR translation pairs for technical sentences ─────────────────
const EN_TO_FR = {
  'Screen readers': 'Lecteurs d\'écran',
  'screen readers': 'lecteurs d\'écran',
  'Keyboard navigation': 'Navigation au clavier',
  'keyboard navigation': 'navigation au clavier',
  'keyboard': 'clavier',
  'Visible focus': 'Focus visible',
  'visible focus': 'focus visible',
  'Dark mode': 'Mode sombre',
  'dark mode': 'mode sombre',
  'Color contrast': 'Contraste de couleur',
  'color contrast': 'contraste de couleur',
  'WCAG': 'WCAG',
  'ARIA': 'ARIA',
  'responsive': 'responsive',
  'Responsive': 'Responsive',
  'mobile': 'mobile',
  'desktop': 'bureau',
  'animation': 'animation',
  'animations': 'animations',
  'component': 'composant',
  'Component': 'Composant',
  'variants': 'variantes',
  'Variants': 'Variantes',
  'accessibility': 'accessibilité',
  'Accessibility': 'Accessibilité',
  'best practices': 'bonnes pratiques',
  'Best practices': 'Bonnes pratiques',
  'properties': 'propriétés',
  'container': 'conteneur',
  'button': 'bouton',
  'layout': 'mise en page',
  'elements': 'éléments',
  'the component': 'le composant',
  'The component': 'Le composant',
  'separator': 'séparateur',
  'touch': 'tactile',
  'hover': 'survol',
  'focus states': 'états de focus',
  'on hover': 'au survol',
  'on click': 'au clic',
};

function translateEnToFr(text) {
  let result = text;
  // Sort by length descending to replace longer phrases first
  const pairs = Object.entries(EN_TO_FR).sort((a, b) => b[0].length - a[0].length);
  for (const [en, fr] of pairs) {
    result = result.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fr);
  }
  return result;
}

function translateEnToEs(text) {
  const pairs = {
    'Screen readers': 'Lectores de pantalla',
    'screen readers': 'lectores de pantalla',
    'Keyboard navigation': 'Navegación por teclado',
    'keyboard navigation': 'navegación por teclado',
    'keyboard': 'teclado',
    'Visible focus': 'Foco visible',
    'visible focus': 'foco visible',
    'Dark mode': 'Modo oscuro',
    'dark mode': 'modo oscuro',
    'Color contrast': 'Contraste de color',
    'color contrast': 'contraste de color',
    'accessible': 'accesible',
    'Accessible': 'Accesible',
    'the component': 'el componente',
    'The component': 'El componente',
    'component': 'componente',
    'Component': 'Componente',
    'container': 'contenedor',
    'button': 'botón',
    'elements': 'elementos',
    'properties': 'propiedades',
    'animation': 'animación',
    'animations': 'animaciones',
    'responsive': 'responsivo',
    'touch': 'táctil',
    'hover': 'hover',
    'navigation': 'navegación',
    'on click': 'al clic',
    'the browser': 'el navegador',
    'automatically': 'automáticamente',
  };
  let result = text;
  const sorted = Object.entries(pairs).sort((a, b) => b[0].length - a[0].length);
  for (const [en, es] of sorted) {
    result = result.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), es);
  }
  return result;
}

// ── Process files ──────────────────────────────────────────────────────────
function findDocFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findDocFiles(full));
    } else if (entry.endsWith('.astro') && entry !== 'index.astro' && entry !== 'progressbar.astro' && entry !== 'video.astro') {
      results.push(full);
    }
  }
  return results;
}

const files = findDocFiles(docBase);
console.log(`\n📂 Found ${files.length} doc files to process\n`);

// Load JSON files
const jsonData = {};
for (const locale of ['fr', 'en', 'es', 'ar']) {
  jsonData[locale] = JSON.parse(readFileSync(resolve(i18nDir, `${locale}.json`), 'utf8'));
}

let totalKeys = 0;
let totalReplacements = 0;
const fileStats = [];

for (const filePath of files) {
  const pageName = getPageName(filePath);
  const isFrenchPage = FRENCH_PAGES.has(pageName);
  
  let content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find frontmatter end
  let frontmatterEnd = 0;
  let dashes = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashes++;
      if (dashes === 2) { frontmatterEnd = i; break; }
    }
  }
  
  // Extract hardcoded text with context
  const uiTexts = [];
  
  // Pattern: <tag>hardcoded text</tag> or <tag>hardcoded text (multiline possible)
  // We target <li>, <p> tags that contain literal text (not {expressions})
  const tagPattern = /<(li|p|span|td|label|button|TableHead|TableCell)\b[^>]*>\s*([^<{][^<]*?)\s*<\/(li|p|span|td|label|button|TableHead|TableCell)>/g;
  
  // Also match inline text after > on same line for some patterns
  const htmlContent = content.slice(content.indexOf('---', content.indexOf('---') + 3) + 3);
  
  let match;
  const simpleTagRegex = /<(li|p)\b[^>]*>\s*"?([^<{}"]+)"?\s*<\/(li|p)>/g;
  
  // Find all hardcoded text in <li> and <p> tags (single-line)
  while ((match = simpleTagRegex.exec(htmlContent)) !== null) {
    const tag = match[1];
    const text = match[2].trim().replace(/^"/, '').replace(/"$/, '');
    
    if (text.length < 10) continue;
    if (isDemoContent(text)) continue;
    if (!isUIText(text) && text.length < 40) continue; // Short non-UI text = probably demo
    
    // Check it's not already i18n'd
    if (match[0].includes('{t.') || match[0].includes('{d.') || match[0].includes('{p.')) continue;
    
    uiTexts.push({ tag, text, fullMatch: match[0] });
  }
  
  // Also check for multiline <p> content (text on next line after <p>)
  for (let i = frontmatterEnd + 1; i < lines.length; i++) {
    const line = lines[i];
    const pOpen = line.match(/^(\s*)<(p|li)\b[^>]*>\s*$/);
    if (pOpen) {
      const nextLine = lines[i + 1]?.trim() || '';
      const closeLine = lines[i + 2]?.trim() || '';
      if (nextLine && !nextLine.startsWith('{') && !nextLine.startsWith('<') && (closeLine.startsWith('</p>') || closeLine.startsWith('</li>'))) {
        const text = nextLine.replace(/^"/, '').replace(/"$/, '');
        if (text.length >= 10 && !isDemoContent(text) && (isUIText(text) || text.length >= 40)) {
          const tag = pOpen[2];
          const fullMatch = lines[i] + '\n' + lines[i + 1] + '\n' + lines[i + 2];
          uiTexts.push({ tag, text, fullMatch, multiline: true, lineIndex: i });
        }
      }
    }
  }
  
  // Deduplicate
  const seen = new Set();
  const uniqueTexts = uiTexts.filter(t => {
    const key = t.text;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  if (uniqueTexts.length === 0) {
    continue;
  }
  
  console.log(`📄 ${pageName} — ${uniqueTexts.length} UI texts found`);
  
  // Ensure docs.pages.{pageName} exists in all JSONs
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    if (!jsonData[locale].docs) jsonData[locale].docs = {};
    if (!jsonData[locale].docs.pages) jsonData[locale].docs.pages = {};
    if (!jsonData[locale].docs.pages[pageName]) jsonData[locale].docs.pages[pageName] = {};
  }
  
  let pageKeys = 0;
  let pageReplacements = 0;
  
  for (let idx = 0; idx < uniqueTexts.length; idx++) {
    const { tag, text, fullMatch, multiline, lineIndex } = uniqueTexts[idx];
    const keyName = `ui${idx + 1}`;
    
    // Determine translations
    let frText, enText, esText, arText;
    
    if (isFrenchPage) {
      // Source is French
      frText = text;
      enText = translateEnToFr(text); // This won't work for FR→EN, so use the text as-is for now
      // For French source, we need proper EN translations - use the text for now
      enText = text; // Keep FR text in EN (the pages already show this way)
      esText = text;
      arText = text;
    } else {
      // Source is English
      enText = text;
      frText = translateEnToFr(text);
      esText = translateEnToEs(text);
      arText = text; // Arabic gets English text as fallback
    }
    
    // Add to JSON files (only if key doesn't exist yet)
    const page = jsonData.fr.docs.pages[pageName];
    if (!page[keyName]) {
      jsonData.fr.docs.pages[pageName][keyName] = frText;
      jsonData.en.docs.pages[pageName][keyName] = enText;
      jsonData.es.docs.pages[pageName][keyName] = esText;
      jsonData.ar.docs.pages[pageName][keyName] = arText;
      pageKeys++;
      totalKeys++;
    }
    
    // Replace in .astro content
    const fallbackText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
    const shortFallback = text.length > 60 ? text.slice(0, 57) + '...' : text;
    const cleanFallback = shortFallback.replace(/"/g, '\\"');
    
    if (multiline && lineIndex !== undefined) {
      // Replace multiline: keep the original structure but wrap content
      const indent = lines[lineIndex + 1].match(/^(\s*)/)?.[1] || '            ';
      const oldLine = lines[lineIndex + 1];
      const newLine = `${indent}{p.${keyName} ?? "${cleanFallback}"}`;
      content = content.replace(oldLine, newLine);
      pageReplacements++;
    } else {
      // Replace single-line
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const replaceRegex = new RegExp(
        `(<${tag}\\b[^>]*>)\\s*"?${escaped}"?\\s*(<\\/${tag}>)`,
        ''
      );
      const newContent = content.replace(replaceRegex, `$1{p.${keyName} ?? "${cleanFallback}"}$2`);
      if (newContent !== content) {
        content = newContent;
        pageReplacements++;
      }
    }
  }
  
  // Write modified .astro file
  writeFileSync(filePath, content, 'utf8');
  
  fileStats.push({ pageName, keys: pageKeys, replacements: pageReplacements, total: uniqueTexts.length });
  totalReplacements += pageReplacements;
}

// Write all JSON files
for (const locale of ['fr', 'en', 'es', 'ar']) {
  writeFileSync(resolve(i18nDir, `${locale}.json`), JSON.stringify(jsonData[locale], null, 2) + '\n', 'utf8');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`Total new i18n keys: ${totalKeys}`);
console.log(`Total .astro replacements: ${totalReplacements}`);
console.log(`\nPer file:`);
for (const s of fileStats) {
  console.log(`  ${s.pageName}: ${s.keys} keys, ${s.replacements}/${s.total} replaced`);
}
console.log('\n✅ Done!');
