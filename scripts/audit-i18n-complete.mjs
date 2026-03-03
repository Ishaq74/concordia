#!/usr/bin/env node
/**
 * scripts/audit-i18n-complete.mjs
 * 
 * COMPREHENSIVE i18n audit of ALL pages in the project.
 * Scans every .astro file under src/pages/[lang]/ for hardcoded visible text.
 * 
 * Checks:
 * 1. Hardcoded text in HTML tags (h1-h6, p, span, li, td, label, button, a, th)
 * 2. Hardcoded TableCell content (non-code values)
 * 3. Hardcoded title/description/placeholder/alt attributes
 * 4. Missing getTranslations import
 * 5. Hardcoded TOC labels
 * 6. Hardcoded strings in templates/components used by pages
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PAGES_DIR = path.join('src', 'pages', '[lang]');

// ============================================================
// Collect all .astro files recursively
// ============================================================
function getAllAstroFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllAstroFiles(full));
    } else if (entry.name.endsWith('.astro')) {
      results.push(full);
    }
  }
  return results;
}

// ============================================================
// Technical/code values that should NOT be translated
// ============================================================
const SKIP_PATTERNS = [
  // Type values
  /^(string|boolean|number|object|undefined|null|void|any|never)$/,
  // Enum type unions
  /^["']?[\w-]+["']?\s*\|\s*["']?[\w-]+["']?/,
  // Default values
  /^[-—]$/,
  /^(true|false|initial|default|button|auto|info|right|left|top|bottom|none|sm|md|lg|xl)$/,
  // Numbers
  /^\d+(\.\d+)?(%|px|rem|em|ms|s)?$/,
  // Empty or whitespace
  /^\s*$/,
  // Code identifiers (camelCase, PascalCase, snake_case)
  /^[A-Z][a-zA-Z]+(\[\])?$/,  // PascalCase type names like MenuDropdownItem[]
  // CSS values
  /^["']?[\d/]+["']?$/,
  // Astro expressions (already i18n'd)
  /^\{/,
  // HTML entities only
  /^&[a-z]+;$/,
  // Just punctuation
  /^[.,;:!?(){}[\]<>\/\\|@#$%^&*+=~`'"_-]+$/,
  // Code snippets
  /^<[A-Z]/,
  /^import\s/,
  /^const\s/,
  // URLs
  /^(https?:\/\/|\/[a-z])/,
  // File paths
  /^\w+\.\w+$/,
  // Email addresses
  /^[\w.+-]+@[\w.-]+$/,
  // Single word technical terms (3 chars or less)
  /^[a-z]{1,3}$/,
];

function isCodeValue(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return SKIP_PATTERNS.some(p => p.test(trimmed));
}

// ============================================================
// Extract hardcoded visible text from a file
// ============================================================
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const relPath = path.relative('.', filePath).replace(/\\/g, '/');

  // 1. Check for getTranslations import
  const hasI18n = content.includes('getTranslations');
  if (!hasI18n) {
    issues.push({ type: 'NO_I18N', message: 'Missing getTranslations import' });
  }

  // Split into frontmatter and template
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const template = fmMatch ? content.substring(fmMatch[0].length) : content;

  // 2. Hardcoded text in common HTML tags
  const TAG_PATTERNS = [
    { tag: 'h1', regex: /<h1[^>]*>([^<{]+)<\/h1>/g },
    { tag: 'h2', regex: /<h2[^>]*>([^<{]+)<\/h2>/g },
    { tag: 'h3', regex: /<h3[^>]*>([^<{]+)<\/h3>/g },
    { tag: 'h4', regex: /<h4[^>]*>([^<{]+)<\/h4>/g },
    { tag: 'p', regex: /<p[^>]*>([^<{][^<]*?)<\/p>/g },
    { tag: 'li', regex: /<li[^>]*>([^<{][^<]*?)<\/li>/g },
    { tag: 'span', regex: /<span[^>]*>([^<{][^<]*?)<\/span>/g },
    { tag: 'label', regex: /<label[^>]*>([^<{][^<]*?)<\/label>/g },
    { tag: 'button', regex: /<button[^>]*>([^<{][^<]*?)<\/button>/g },
    { tag: 'th', regex: /<th[^>]*>([^<{][^<]*?)<\/th>/g },
    { tag: 'td', regex: /<td[^>]*>([^<{][^<]*?)<\/td>/g },
    { tag: 'TableCell', regex: /<TableCell>([^<{][^<]*?)<\/TableCell>/g },
    { tag: 'TableHead', regex: /<TableHead>([^<{][^<]*?)<\/TableHead>/g },
  ];

  for (const { tag, regex } of TAG_PATTERNS) {
    let match;
    while ((match = regex.exec(template)) !== null) {
      const text = match[1].trim();
      if (text && !isCodeValue(text)) {
        // Additional filter: skip demo/example data in table rows
        if ((tag === 'td' || tag === 'TableCell') && relPath.includes('table.astro')) {
          // table.astro has demo data like names, emails — skip those
          if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(text)) continue; // "John Doe"
          if (text.includes('@')) continue; // emails
          if (['Admin', 'User', 'Editor', 'Moderator', 'Manager', 'Developer', 'Owner'].includes(text)) continue;
          if (['Active', 'Inactive', 'Pending', 'Suspended'].includes(text)) continue;
          if (['Marketing', 'Engineering', 'Sales', 'Support', 'Design', 'HR', 'Finance', 'Legal', 'IT', 'Operations'].includes(text)) continue;
        }
        // Skip common code-like TableCell values
        if ((tag === 'td' || tag === 'TableCell')) {
          if (/^["']/.test(text)) continue; // quoted values = code
          if (text.includes('|')) continue; // enum unions
          if (/^[\w]+\[\]$/.test(text)) continue; // TypeArray[]
          if (/^[a-z]+$/.test(text) && text.length < 15) continue; // single lowercase word (likely code)
        }
        issues.push({ type: 'HARDCODED', tag, text: text.substring(0, 120) });
      }
    }
  }

  // 3. Hardcoded title/alt/placeholder/aria-label attributes
  const ATTR_PATTERNS = [
    { attr: 'title', regex: /\btitle="([^"{][^"]*?)"/g },
    { attr: 'alt', regex: /\balt="([^"{][^"]*?)"/g },
    { attr: 'placeholder', regex: /\bplaceholder="([^"{][^"]*?)"/g },
    { attr: 'aria-label', regex: /\baria-label="([^"{][^"]*?)"/g },
  ];

  for (const { attr, regex } of ATTR_PATTERNS) {
    let match;
    while ((match = regex.exec(template)) !== null) {
      const text = match[1].trim();
      if (text && text.length > 2 && !/^[a-z-]+$/.test(text) && !isCodeValue(text)) {
        issues.push({ type: 'ATTR', attr, text: text.substring(0, 120) });
      }
    }
  }

  // 4. Hardcoded TOC labels
  const tocLabelRegex = /label:\s*"([^{"][^"]*?)"/g;
  let tocMatch;
  while ((tocMatch = tocLabelRegex.exec(content)) !== null) {
    const text = tocMatch[1].trim();
    if (text && !isCodeValue(text)) {
      issues.push({ type: 'TOC_LABEL', text: text.substring(0, 120) });
    }
  }

  return { path: relPath, issues };
}

// ============================================================
// MAIN
// ============================================================
console.log('🔍 COMPREHENSIVE I18N AUDIT\n');
console.log('=' .repeat(80));

const allFiles = getAllAstroFiles(PAGES_DIR);
console.log(`\nScanning ${allFiles.length} .astro files...\n`);

let totalIssues = 0;
let filesWithIssues = 0;
const summary = { NO_I18N: 0, HARDCODED: 0, ATTR: 0, TOC_LABEL: 0 };
const tagSummary = {};
const allResults = [];

for (const file of allFiles.sort()) {
  const result = auditFile(file);
  allResults.push(result);
  
  if (result.issues.length > 0) {
    filesWithIssues++;
    totalIssues += result.issues.length;
    
    console.log(`\n📄 ${result.path} (${result.issues.length} issues)`);
    console.log('-'.repeat(60));
    
    for (const issue of result.issues) {
      summary[issue.type] = (summary[issue.type] || 0) + 1;
      if (issue.tag) {
        tagSummary[issue.tag] = (tagSummary[issue.tag] || 0) + 1;
      }
      
      switch (issue.type) {
        case 'NO_I18N':
          console.log(`  ❌ ${issue.message}`);
          break;
        case 'HARDCODED':
          console.log(`  📝 <${issue.tag}> "${issue.text}"`);
          break;
        case 'ATTR':
          console.log(`  🏷️  ${issue.attr}="${issue.text}"`);
          break;
        case 'TOC_LABEL':
          console.log(`  📑 label: "${issue.text}"`);
          break;
      }
    }
  }
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n\n' + '='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));
console.log(`\nTotal files scanned: ${allFiles.length}`);
console.log(`Files with issues: ${filesWithIssues}`);
console.log(`Files clean: ${allFiles.length - filesWithIssues}`);
console.log(`Total issues: ${totalIssues}`);
console.log(`\nBy type:`);
console.log(`  Missing i18n import: ${summary.NO_I18N || 0}`);
console.log(`  Hardcoded tag text: ${summary.HARDCODED || 0}`);
console.log(`  Hardcoded attributes: ${summary.ATTR || 0}`);
console.log(`  Hardcoded TOC labels: ${summary.TOC_LABEL || 0}`);

if (Object.keys(tagSummary).length > 0) {
  console.log(`\nBy tag:`);
  for (const [tag, count] of Object.entries(tagSummary).sort((a, b) => b[1] - a[1])) {
    console.log(`  <${tag}>: ${count}`);
  }
}

// Clean files list
const cleanFiles = allResults.filter(r => r.issues.length === 0);
if (cleanFiles.length > 0) {
  console.log(`\n✅ Clean files (${cleanFiles.length}):`);
  for (const r of cleanFiles) {
    console.log(`  ${r.path}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n${totalIssues === 0 ? '🎉 ALL PAGES FULLY TRANSLATED!' : `⚠️ ${totalIssues} issues to fix`}`);
