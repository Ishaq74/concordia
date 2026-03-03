/**
 * Sync all locale JSON files against the FR reference.
 *
 * - Copies missing keys from FR with a "[TODO:translate] " prefix for string values
 * - Removes extra keys not present in FR
 * - Preserves existing translations
 * - Maintains the same key order as FR
 *
 * Usage: node scripts/sync-translations.cjs
 */

const fs = require("fs");
const path = require("path");

const I18N_DIR = path.resolve(__dirname, "..", "src", "i18n");
const REF_LOCALE = "fr";
const LOCALES = ["en", "es", "ar"];

function deepGet(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

function deepSet(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] == null || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function collectKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/** Rebuild an object so keys appear in the same order as refKeys */
function reorderObject(obj, refKeys) {
  const result = {};
  // Group keys by their top-level and nested paths
  const refSections = [];
  const seen = new Set();
  for (const k of refKeys) {
    const topLevel = k.split(".")[0];
    if (!seen.has(topLevel)) {
      seen.add(topLevel);
      refSections.push(topLevel);
    }
  }

  for (const section of refSections) {
    if (obj[section] !== undefined) {
      if (typeof obj[section] === "object" && obj[section] !== null && !Array.isArray(obj[section])) {
        // Recursively reorder nested objects using ref keys
        const sectionRefKeys = refKeys
          .filter((k) => k.startsWith(section + "."))
          .map((k) => k.slice(section.length + 1));
        result[section] = reorderObject(obj[section], sectionRefKeys);
      } else {
        result[section] = obj[section];
      }
    }
  }

  return result;
}

// Load FR reference
const frPath = path.join(I18N_DIR, `${REF_LOCALE}.json`);
const fr = JSON.parse(fs.readFileSync(frPath, "utf-8"));
const frKeys = collectKeys(fr);

console.log(`FR reference: ${frKeys.length} keys in ${new Set(frKeys.map((k) => k.split(".")[0])).size} sections\n`);

for (const locale of LOCALES) {
  const locPath = path.join(I18N_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(locPath, "utf-8"));
  const locKeys = new Set(collectKeys(data));

  const missing = frKeys.filter((k) => !locKeys.has(k));
  const extra = [...locKeys].filter((k) => !new Set(frKeys).has(k));

  console.log(`${locale.toUpperCase()}: ${locKeys.size} keys → missing ${missing.length}, extra ${extra.length}`);

  // Add missing keys
  for (const key of missing) {
    const frValue = deepGet(fr, key);
    if (typeof frValue === "string") {
      deepSet(data, key, `[TODO:translate] ${frValue}`);
    } else {
      // numbers, booleans, arrays — copy as-is
      deepSet(data, key, frValue);
    }
  }

  // Remove extra keys
  for (const key of extra) {
    const parts = key.split(".");
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    delete current[parts[parts.length - 1]];
    console.log(`  removed extra key: ${key}`);
  }

  // Reorder to match FR key order
  const ordered = reorderObject(data, frKeys);

  // Write back
  fs.writeFileSync(locPath, JSON.stringify(ordered, null, 2) + "\n", "utf-8");

  const newKeys = collectKeys(ordered);
  console.log(`  → wrote ${newKeys.length} keys (was ${locKeys.size})`);

  // Verify
  const todoCount = newKeys.filter((k) => {
    const v = deepGet(ordered, k);
    return typeof v === "string" && v.startsWith("[TODO:translate]");
  }).length;
  if (todoCount > 0) {
    console.log(`  ⚠ ${todoCount} keys need translation (marked [TODO:translate])`);
  }

  console.log();
}

console.log("Done. Run the translation coverage test to verify:");
console.log("  npx vitest run tests/i18n/translation-coverage.test.ts");
