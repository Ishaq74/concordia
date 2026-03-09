/**
 * Database migration integrity tests.
 *
 * Validates that migrations, journal, snapshots, and schema barrel
 * are consistent and well-formed. Runs purely on the filesystem —
 * no DB connection required.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MIGRATIONS_DIR = path.resolve(ROOT, 'src/database/migrations')
const META_DIR = path.join(MIGRATIONS_DIR, 'meta')
const JOURNAL_PATH = path.join(META_DIR, '_journal.json')
const SCHEMAS_BARREL = path.resolve(ROOT, 'src/database/schemas.ts')
const SCHEMAS_DIR = path.resolve(ROOT, 'src/database/schemas')

// ── Journal structure ─────────────────────────────────────────────────

describe('Migration journal', () => {
  it('journal file exists', () => {
    expect(fs.existsSync(JOURNAL_PATH)).toBe(true)
  })

  it('is valid JSON with entries array', () => {
    const journal = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'))
    expect(journal).toHaveProperty('entries')
    expect(Array.isArray(journal.entries)).toBe(true)
    expect(journal.entries.length).toBeGreaterThan(0)
  })

  it('entries have sequential idx', () => {
    const { entries } = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'))
    entries.forEach((e: { idx: number }, i: number) => {
      expect(e.idx).toBe(i)
    })
  })

  it('entries have required fields', () => {
    const { entries } = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'))
    for (const entry of entries) {
      expect(entry).toHaveProperty('tag')
      expect(entry).toHaveProperty('version')
      expect(typeof entry.tag).toBe('string')
    }
  })
})

// ── SQL migration files ───────────────────────────────────────────────

describe('SQL migration files', () => {
  const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()

  it('at least one SQL migration exists', () => {
    expect(sqlFiles.length).toBeGreaterThan(0)
  })

  it('each SQL file is non-empty', () => {
    for (const file of sqlFiles) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      expect(content.trim().length, `${file} should not be empty`).toBeGreaterThan(0)
    }
  })

  it('each SQL file contains SQL statements', () => {
    const sqlKeywords = /\b(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SELECT)\b/i
    for (const file of sqlFiles) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      expect(sqlKeywords.test(content), `${file} should contain SQL keywords`).toBe(true)
    }
  })

  it('SQL files follow numeric prefix convention', () => {
    for (const file of sqlFiles) {
      expect(file).toMatch(/^\d{4}_/)
    }
  })

  it('every SQL file has a matching journal entry', () => {
    const { entries } = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'))
    const tags = new Set(entries.map((e: { tag: string }) => e.tag))
    for (const file of sqlFiles) {
      const tag = file.replace('.sql', '')
      expect(tags.has(tag), `${file} should be tracked in journal`).toBe(true)
    }
  })
})

// ── Snapshots ─────────────────────────────────────────────────────────

describe('Migration snapshots', () => {
  const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()

  it('each SQL migration has a corresponding snapshot', () => {
    for (const file of sqlFiles) {
      const prefix = file.match(/^(\d{4})_/)?.[1]
      expect(prefix, `${file} should have a numeric prefix`).toBeTruthy()
      const snapshotName = `${prefix}_snapshot.json`
      expect(
        fs.existsSync(path.join(META_DIR, snapshotName)),
        `snapshot missing for ${file}`
      ).toBe(true)
    }
  })

  it('snapshots are valid JSON', () => {
    const snapshots = fs.readdirSync(META_DIR).filter(f => f.endsWith('_snapshot.json'))
    for (const file of snapshots) {
      expect(() => JSON.parse(fs.readFileSync(path.join(META_DIR, file), 'utf8'))).not.toThrow()
    }
  })
})

// ── Schema barrel consistency ─────────────────────────────────────────

describe('Schema barrel (schemas.ts)', () => {
  it('barrel file exists', () => {
    expect(fs.existsSync(SCHEMAS_BARREL)).toBe(true)
  })

  it('every schema file is exported from barrel', () => {
    const barrel = fs.readFileSync(SCHEMAS_BARREL, 'utf8')
    const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.ts'))
    for (const file of schemaFiles) {
      const moduleName = file.replace('.ts', '')
      expect(barrel, `${file} should be re-exported`).toContain(moduleName)
    }
  })

  it('barrel does not reference nonexistent schema files', () => {
    const barrel = fs.readFileSync(SCHEMAS_BARREL, 'utf8')
    const importPaths = [...barrel.matchAll(/from\s+['"]\.\/schemas\/([^'"]+)['"]/g)]
    for (const [, moduleName] of importPaths) {
      const filePath = path.join(SCHEMAS_DIR, `${moduleName}.ts`)
      expect(fs.existsSync(filePath), `${moduleName}.ts should exist`).toBe(true)
    }
  })
})
