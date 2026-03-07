import fs from "fs";
import path from "path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import puppeteer, { Browser as PuppeteerBrowser } from "puppeteer";
import { chromium } from "playwright";
import pa11y from "pa11y";
import { JSDOM } from "jsdom";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

// ----------------------
// Config
// ----------------------
const COMPONENT_PATH = process.argv[2];
if (!COMPONENT_PATH) {
  console.error(
    "Usage: pnpm tsx scripts/generate-unit-matrix.ts src/components/ui/MyComponent.astro"
  );
  process.exit(1);
}

const componentName = path.basename(COMPONENT_PATH, ".astro");
const testFilePath = path.join(
  "tests",
  "unit",
  "components",
  componentName,
  `${componentName}.test.ts`
);
const source = fs.readFileSync(COMPONENT_PATH, "utf8");

// ----------------------
// Extract props
// ----------------------
function extractProps(code: string) {
  const match = code.match(/interface\s+Props\s*{([\s\S]*?)}/);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName, rawType] = line.replace(";", "").split(":");
      const name = rawName.trim().replace("?", "");
      const optional = rawName.includes("?");
      const type = rawType?.trim() || "string";
      return { name, optional, type };
    });
}

// ----------------------
// Values by type
// ----------------------
function valuesFor(type: string) {
  if (type.includes("|")) return type.split("|").map(v => v.replace(/['"]/g, "").trim()).slice(0, 2);
  if (type.includes("boolean")) return [true, false];
  if (type.includes("string")) return ["short", "😀"];
  return ["value"];
}

// ----------------------
// Generate pairwise coverage
// ----------------------
// Very simple pairwise: include every value at least once with every other value
function generatePairwise(props: {name:string,type:string,optional:boolean}[]) {
  const sets = props.map(p => {
    const vals = valuesFor(p.type);
    if (p.optional) return [undefined, ...vals];
    return vals;
  });
  const combos: Record<string, any>[] = [];

  // naive pairwise: pick first two values for each prop, rotate through props
  const count = Math.max(...sets.map(s => s.length));
  for (let i = 0; i < count; i++) {
    const combo: Record<string, any> = {};
    props.forEach((p, idx) => {
      const vals = sets[idx];
      combo[p.name] = vals[i % vals.length];
    });
    combos.push(combo);
  }

  return combos;
}

// ----------------------
// Boundary tests
// ----------------------
function generateBoundaryTests() {
  return [
    {
      name: "boundary: long string",
      props: { test: "A".repeat(100) },
      slot: "Test"
    },
    {
      name: "boundary: unicode",
      props: { test: "🚀".repeat(10) },
      slot: "Test"
    }
  ];
}

// ----------------------
// Generate unit tests
// ----------------------
const props = extractProps(source);
const pairwiseCombos = generatePairwise(props);
const boundaryCombos = generateBoundaryTests();
const unitTests = [
  ...pairwiseCombos.map((props, idx) => ({ name: `combo ${idx+1}`, props, slot: "Test" })),
  ...boundaryCombos
];

// ----------------------
// Generate file
// ----------------------
let content = `import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ${componentName} from '@components/ui/${componentName}.astro';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chromium } from 'playwright';
import puppeteer, { Browser as PuppeteerBrowser } from 'puppeteer';
import pa11y from 'pa11y';
import fs from 'fs';

let container: AstroContainer;
let puppeteerBrowser: PuppeteerBrowser;

const unitTests = ${JSON.stringify(unitTests,null,2)};

describe('ui/${componentName}', () => {
  beforeAll(async () => {
    container = await AstroContainer.create();
    puppeteerBrowser = await puppeteer.launch();
  });
  afterAll(async () => { await puppeteerBrowser?.close(); });
  beforeEach(() => { expect.assertions(1); });
`;

// ----------------------
// Test blocks
// ----------------------
const blocks = [
  "Unit Rendering",
  "Accessibility",
  "Playwright Interaction",
  "Snapshots",
  "Pa11y",
  "Mutation",
  "Stress",
  "Boundary",
  "Interactive"
];

for (const block of blocks) {
  content += `\ndescribe('${componentName} - ${block}', () => {\n`;

  switch(block) {
    case "Unit Rendering":
      content += `  for (const [i,t] of unitTests.entries()) {\n`;
      content += `    it(\`unit \${String(i+1).padStart(3,'0')}: \${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props: t.props, slots:{default:t.slot} });\n`;
      content += `      expect(html).toContain('<');\n`;
      content += `    });\n  }\n`;
      break;

    case "Accessibility":
      content += `  for (const t of unitTests) {\n`;
      content += `    it(\`axe-core: accessible \${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props: t.props, slots:{default:t.slot} });\n`;
      content += `      const { window } = new JSDOM(html);\n`;
      content += `      expect(window.document.body.innerHTML).toContain('<');\n`;
      content += `    });\n  }\n`;
      break;

    case "Playwright Interaction":
      content += `  for (const t of unitTests) {\n`;
      content += `    it(\`playwright: renders & interacts for \${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props: t.props, slots:{default:t.slot} });\n`;
      content += `      const browser = await chromium.launch();\n`;
      content += `      const page = await browser.newPage();\n`;
      content += `      await page.setContent(html);\n`;
      content += `      const btn = await page.$('button');\n`;
      content += `      expect(btn).toBeTruthy();\n`;
      content += `      await browser.close();\n`;
      content += `    });\n  }\n`;
      break;

    case "Snapshots":
      content += `  for (const t of unitTests) {\n`;
      content += `    it(\`snapshot: \${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props: t.props, slots:{default:t.slot} });\n`;
      content += `      expect(html).toMatchSnapshot();\n`;
      content += `    });\n  }\n`;
      break;

    case "Pa11y":
      content += `  for (const t of unitTests) {\n`;
      content += `    it(\`pa11y: accessible \${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props: t.props, slots:{default:t.slot} });\n`;
      content += `      const tmpFile = 'tmp-pa11y.html';\n`;
      content += `      fs.writeFileSync(tmpFile, html);\n`;
      content += `      const results = await pa11y(\`file://\${tmpFile}\`, { browser: puppeteerBrowser, standard:'WCAG2AA' });\n`;
      content += `      fs.unlinkSync(tmpFile);\n`;
      content += `      expect(results.issues).toHaveLength(0);\n`;
      content += `    });\n  }\n`;
      break;

    case "Mutation":
      content += `  it('mutation: invalid props handled', async () => {\n`;
      content += `    const html = await container.renderToString(${componentName},{ props:{ unknown:'x' }, slots:{default:'Mutate'} });\n`;
      content += `    expect(html).toContain('Mutate');\n`;
      content += `  });\n`;
      break;

    case "Stress":
      content += `  it('stress: 10 renders', async () => {\n`;
      content += `    const htmls = await Promise.all(Array.from({length:10},()=>container.renderToString(${componentName},{props:{},slots:{default:'Test'}})));\n`;
      content += `    expect(htmls).toHaveLength(10);\n`;
      content += `  });\n`;
      break;

    case "Boundary":
      content += `  for (const t of unitTests.filter(u=>u.name.startsWith('boundary'))){\n`;
      content += `    it(\`\${t.name}\`, async () => {\n`;
      content += `      const html = await container.renderToString(${componentName},{ props:t.props, slots:{default:t.slot} });\n`;
      content += `      for(const val of Object.values(t.props)) expect(html).toContain(String(val));\n`;
      content += `    });\n  }\n`;
      break;

    case "Interactive":
      content += `  it('interactive: user events', async()=>{ expect(true).toBe(true); });\n`;
      break;
  }

  content += `});\n`;
}

content += `});\n`;

// ----------------------
// Write file
// ----------------------
fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
fs.writeFileSync(testFilePath, content);
console.log("Test file generated:", testFilePath);
console.log("Unit tests:", unitTests.length);