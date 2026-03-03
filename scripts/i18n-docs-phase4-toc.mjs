#!/usr/bin/env node
/**
 * scripts/i18n-docs-phase4-toc.mjs
 * 
 * Phase 4a: Fix ALL hardcoded TOC label values.
 * Maps label text → docs.common key expressions.
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');
const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// Map label text (case-insensitive) → d.keyName expression
const LABEL_MAP = {
  // English labels
  'installation': 'd.installation',
  'props': 'd.props',
  'variants': 'd.variants',
  'colors': 'd.colors',
  'sizes': 'd.sizes',
  'accessibility': 'd.accessibility',
  'best practices': 'd.bestPractices',
  'api reference': 'd.apiReference',
  'basic usage': 'd.basicUsage',
  'usage examples': 'd.usageExamples',
  'usage': 'd.usage',
  'examples': 'd.examples',
  'interactive demo': 'd.interactiveDemoH2',
  'disabled state': 'd.disabledState',
  'customization': 'd.customization',
  'positions': 'd.positions',
  'icons': 'd.icons',
  'with icons': 'd.withIcons',
  'themes': 'd.themes',
  'labels': 'd.labels',
  'responsive': 'd.responsive',
  'with form': 'd.withForm',
  'external trigger': 'd.externalTrigger',
  'opening sides': 'd.openingSides',
  'how does it work?': 'd.howItWorks',
  'button types': 'd.buttonTypes',
  'buttons with icons': 'd.buttonsWithIcons',
  'button states': 'd.buttonStates',
  'different statuses': 'd.differentStatuses',
  'dismissible alerts': 'd.dismissibleAlerts',
  'native features': 'd.nativeFeatures',
  'recursive menus': 'd.recursiveMenus',
  'features': 'd.features',
  'css customization': 'd.cssCustomization',
  'css variables': 'd.cssVariables',
  'resources': 'd.resources',
  'structure': 'd.structure',
  'content': 'd.content',
  'display modes': 'd.displayModes',
  'autoplay': 'd.autoplay',
  'with title': 'd.withTitle',
  'dismissible': 'd.dismissible',
  'with close button': 'd.withCloseButton',
  'comparison with link': 'd.comparisonWithLink',
  'with custom icons': 'd.withCustomIcons',
  'elevations': 'd.elevations',
  'interactive': 'd.interactiveCard',
  'aspect ratios': 'd.aspectRatios',
  'syntax highlighting': 'd.syntaxHighlighting',
  'line numbers': 'd.lineNumbers',
  'code themes': 'd.codeThemes',
  'keyboard navigation': 'd.keyboardNavigation',
  'modifier keys': 'd.modifierKeys',
  'special keys': 'd.specialKeys',
  'combinations': 'd.combinations',
  'link styles': 'd.linkStyles',
  'button style': 'd.buttonStyle',
  'sub-menus': 'd.subMenus',
  'menu with icons': 'd.menuWithIcons',
  'menu positions': 'd.menuPositions',
  'with separators': 'd.withSeparators',
  'with ellipsis': 'd.withEllipsis',
  'switch states': 'd.switchStates',
  'with labels': 'd.withLabels',
  'table with caption': 'd.tableWithCaption',
  'striped table': 'd.tableStriped',
  'with footer': 'd.withFooter',
  'tabs with icons': 'd.tabsWithIconsH2',
  'vertical tabs': 'd.verticalTabs',
  'auto switch': 'd.autoSwitchTabs',
  'tooltip positions': 'd.tooltipPositions',
  'tooltip colors': 'd.tooltipColors',
  'video controls': 'd.videoControls',
  'video sizes': 'd.videoSizes',
  'playback options': 'd.playbackOptions',
  'multiple sources': 'd.multipleSources',
  'dark mode': 'd.darkMode',
  'single mode': 'd.singleMode',
  'with slot': 'd.withSlot',
  'stripes': 'd.stripes',
  'playback': 'd.playback',
  'subtitles': 'd.subtitles',
  'shortcuts': 'd.shortcuts',
  'symbols': 'd.symbols',
  'shapes': 'd.shapes',
  'grid mode': 'd.gridMode',
  'masonry mode': 'd.masonryMode',
  'carousel mode': 'd.carouselMode',
  'lightbox': 'd.lightbox',
  'page size': 'd.pageSize',
  'advanced': 'd.advanced',

  // French labels  
  'utilisation basique': 'd.basicUsage',
  'couleurs': 'd.colors',
  'tailles': 'd.sizes',
  'accessibilité': 'd.accessibility',
  'meilleures pratiques': 'd.bestPractices',
  'référence api': 'd.apiReference',
  "côtés d'ouverture": 'd.openingSides',
  'comment ça marche ?': 'd.howItWorks',
  'types de bouton': 'd.buttonTypes',
  'boutons avec icônes': 'd.buttonsWithIcons',
  'états du bouton': 'd.buttonStates',
  'différents statuts': 'd.differentStatuses',
  'alertes supprimables': 'd.dismissibleAlerts',
  'fonctionnalités natives': 'd.nativeFeatures',
  'menus récursifs': 'd.recursiveMenus',
  'fonctionnalités': 'd.features',
  'personnalisation css': 'd.cssCustomization',
  'variables css': 'd.cssVariables',
  'ressources': 'd.resources',
  'utilisation': 'd.usage',
  'contenu': 'd.content',
  "modes d'affichage": 'd.displayModes',
  'lecture automatique': 'd.autoplay',
  'avec titre': 'd.withTitle',
  'supprimable': 'd.dismissible',
  'navigation clavier': 'd.keyboardNavigation',
  'exemples': 'd.examples',
  'sous-menus': 'd.subMenus',
  'positions du menu': 'd.menuPositions',
  'menu avec icônes': 'd.menuWithIcons',
  'avec séparateurs': 'd.withSeparators',
  'avec ellipses': 'd.withEllipsis',
  'états du switch': 'd.switchStates',
  'avec labels': 'd.withLabels',
  'positions': 'd.positions',
  'icônes': 'd.icons',
  'responsive': 'd.responsive',
  'avec formulaire': 'd.withForm',
  'déclencheur externe': 'd.externalTrigger',
  'personnalisation': 'd.customization',
  'thèmes': 'd.themes',

  // New phase-3 keys (EN)
  'dismissible badges': 'd.dismissibleBadges',
  'quick demo': 'd.quickDemo',
  'keyboard shortcuts': 'd.keyboardShortcuts',
  'symbols and special keys': 'd.symbolsAndSpecialKeys',
  'external links': 'd.externalLinks',
  'html button': 'd.htmlButton',
  'in a navigation': 'd.inNavigation',
  'recursive menus (multi-level)': 'd.recursiveMenus',
  '"master" features (zero-js)': 'd.masterFeatures',
  'technical notes': 'd.technicalNotes',
  'error handling': 'd.errorHandling',
  'with caption': 'd.withCaption',
  'striped table (zebra)': 'd.stripedTable',
  'responsive (horizontal scroll)': 'd.responsiveScroll',
  'all variants': 'd.allVariants',
  'available components': 'd.availableComponents',
  'advanced examples': 'd.advancedExamples',
  'technical details': 'd.technicalDetails',
  'with other components': 'd.withComponents',
  'full example': 'd.fullExample',
  'avatar group': 'd.avatarGroup',
  'avatar cards': 'd.avatarCards',
  'usage cases': 'd.avatarUsageCases',
  'custom separators': 'd.customSeparators',
  'product mode': 'd.productMode',
  'enhanced mode': 'd.enhancedMode',
  'advanced options': 'd.advancedOptions',
  'smart logic': 'd.smartLogic',
  'usage with astro': 'd.usageWithAstro',
  'custom sizes': 'd.customSizesH2',
  'multiple skeletons': 'd.multipleSkeletons',
  'compositions': 'd.compositionsH2',
  'auto scroll': 'd.autoScroll',
  'vertical orientation': 'd.verticalOrientation',
  'horizontal orientation': 'd.horizontalOrientation',
  'alternate orientation': 'd.alternateOrientation',
  'icon shapes': 'd.iconShapes',
  'data examples': 'd.dataExamples',
  'layout structure': 'd.layoutStructure',
  'responsive grid layout': 'd.responsiveGridLayout',

  // French phase-3 equivalents
  'badges supprimables': 'd.dismissibleBadges',
  'démonstration rapide': 'd.quickDemo',
  'raccourcis clavier': 'd.keyboardShortcuts',
  'symboles et touches spéciales': 'd.symbolsAndSpecialKeys',
  'liens externes': 'd.externalLinks',
  'bouton html': 'd.htmlButton',
  'dans une navigation': 'd.inNavigation',
  'notes techniques': 'd.technicalNotes',
  'gestion des erreurs': 'd.errorHandling',
  'avec légende': 'd.withCaption',
  'exemples avancés': 'd.advancedExamples',
  'composants disponibles': 'd.availableComponents',
  'toutes les variantes': 'd.allVariants',
  'détails techniques': 'd.technicalDetails',
  'exemple complet': 'd.fullExample',
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Replace label: "text" with label: d.key ?? "text"
  content = content.replace(/label:\s*"([^"]+)"/g, (match, labelText) => {
    const key = LABEL_MAP[labelText.toLowerCase()];
    if (key) {
      return `label: ${key} ?? "${labelText}"`;
    }
    // If no mapping found, leave as is but log it
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ============================================================
// MAIN
// ============================================================
console.log('🔄 Phase 4a: Fix ALL TOC labels\n');

const allFiles = [
  'design/alert', 'design/badge', 'design/button', 'design/card',
  'design/code', 'design/dialog', 'design/dropdown', 'design/form',
  'design/kbd', 'design/link', 'design/menudropdown', 'design/sheet',
  'design/switch', 'design/table', 'design/tabs', 'design/tooltip',
  'design/video',
  'components/accordion', 'components/avatar', 'components/breadcrumb',
  'components/gallery', 'components/pagination', 'components/progressbar',
  'components/skeleton', 'components/slider', 'components/timeline',
  'layouts/base', 'layouts/doc',
  'templates/footer', 'templates/header', 'templates/table-of-contents',
];

let changed = 0, unchanged = 0, unmatched = new Set();
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) { continue; }
  
  // First pass: collect unmatched labels
  const content = fs.readFileSync(fp, 'utf8');
  const labels = content.match(/label:\s*"([^"]+)"/g) || [];
  for (const m of labels) {
    const labelText = m.match(/label:\s*"([^"]+)"/)[1];
    if (!LABEL_MAP[labelText.toLowerCase()]) {
      unmatched.add(labelText);
    }
  }
  
  const didChange = processFile(fp);
  if (didChange) {
    console.log(`  ✅ ${rel}`);
    changed++;
  } else {
    console.log(`  ⏩ ${rel}`);
    unchanged++;
  }
}

console.log(`\n📊 Summary: ${changed} changed, ${unchanged} unchanged`);

if (unmatched.size > 0) {
  console.log(`\n⚠️ Unmatched TOC labels (${unmatched.size}):`);
  for (const label of [...unmatched].sort()) {
    console.log(`  → "${label}"`);
  }
}

// Recount
let remaining = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  const labels = (c.match(/label:\s*"[^"]+"/g) || []).filter(m => !m.includes('??'));
  remaining += labels.length;
}
console.log(`\nRemaining unmatched labels: ${remaining}`);
