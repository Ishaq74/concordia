/**
 * Dedicated unit tests for src/lib/auth/validate-user.ts
 *
 * Covers: COMBINED_DANGEROUS regex, validateUserInput() full surface —
 * type checks, field-level validation, email/username/name/password rules,
 * injection vectors, edge cases, and password policy.
 */
import { describe, it, expect } from 'vitest'
import { COMBINED_DANGEROUS, validateUserInput } from '@lib/auth/validate-user'

// ── Helpers ───────────────────────────────────────────────────────────
// Values chosen to avoid matching any dangerous-pattern substring
// (e.g. no 'id', 'sh', 'ls', 'nc', '$' etc.)

const VALID = {
  email: 'yara@example.com',
  username: 'jafar',
  name: 'Yara',
  password: 'Mz9QrFw2X',
}

function valid(overrides: Partial<typeof VALID> = {}) {
  return { ...VALID, ...overrides }
}

// ── 1. COMBINED_DANGEROUS regex ───────────────────────────────────────

describe('COMBINED_DANGEROUS regex', () => {
  const dangerous = [
    '<script>alert(1)</script>',
    '<img onerror=alert(1)>',
    'javascript:void(0)',
    '${process.env}',
    '{{constructor}}',
    '`id`',
    '; rm -rf /',
    'cat /etc/passwd',
    "' OR '1'='1",
    'SELECT * FROM users',
    'DROP TABLE user',
    'UNION SELECT 1',
    '$ne',
    '$where',
    'db.collection',
    '../../../etc/passwd',
    'test\x00admin',
    '\u202emalicious',
  ]

  for (const payload of dangerous) {
    it(`detects: ${payload.slice(0, 40)}`, () => {
      expect(COMBINED_DANGEROUS.test(payload)).toBe(true)
    })
  }

  const safe = [
    'Hello worlk',
    'Bon article',
    'A text about foobar 123',
    'yara@example.com',
    'Mon prenom',
  ]

  for (const text of safe) {
    it(`allows safe text: ${text}`, () => {
      expect(COMBINED_DANGEROUS.test(text)).toBe(false)
    })
  }
})

// ── 2. Type validation ────────────────────────────────────────────────

describe('validateUserInput — type checks', () => {
  it('rejects null fields', () => {
    expect(() => validateUserInput({ email: null, username: 'a', name: 'b', password: 'c' }))
      .toThrow('invalid input type for email')
  })

  it('rejects undefined fields', () => {
    expect(() => validateUserInput({ email: undefined, username: 'a', name: 'b', password: 'c' }))
      .toThrow('invalid input type for email')
  })

  it('rejects number fields', () => {
    expect(() => validateUserInput({ email: 42 as unknown as string, username: 'a', name: 'b', password: 'c' }))
      .toThrow('invalid input type for email')
  })

  it('rejects boolean fields', () => {
    expect(() => validateUserInput({ email: true as unknown as string, username: 'a', name: 'b', password: 'c' }))
      .toThrow('invalid input type for email')
  })

  it('rejects array fields', () => {
    expect(() => validateUserInput({ email: ['a'] as unknown as string, username: 'a', name: 'b', password: 'c' }))
      .toThrow('invalid input type for email')
  })

  it('rejects empty string fields', () => {
    expect(() => validateUserInput(valid({ email: '' }))).toThrow('empty input')
  })

  it('rejects whitespace-only fields', () => {
    expect(() => validateUserInput(valid({ name: '   ' }))).toThrow('empty input')
  })
})

// ── 3. Email validation ───────────────────────────────────────────────

describe('validateUserInput — email', () => {
  it('accepts valid email', () => {
    expect(() => validateUserInput(valid())).not.toThrow()
  })

  it('rejects invalid email format', () => {
    expect(() => validateUserInput(valid({ email: 'not-an-email' }))).toThrow('invalid email')
  })

  it('rejects homograph attack (Cyrillic е)', () => {
    expect(() => validateUserInput(valid({ email: 'us\u0435r@example.com' }))).toThrow('homograph')
  })
})

// ── 4. Username validation ────────────────────────────────────────────

describe('validateUserInput — username', () => {
  it('accepts valid username (3-32 chars)', () => {
    expect(() => validateUserInput(valid({ username: 'abc' }))).not.toThrow()
  })

  it('rejects too-short username', () => {
    expect(() => validateUserInput(valid({ username: 'ab' }))).toThrow('username length')
  })

  it('rejects too-long username (>32)', () => {
    expect(() => validateUserInput(valid({ username: 'a'.repeat(33) }))).toThrow('username length')
  })
})

// ── 5. Name validation ───────────────────────────────────────────────

describe('validateUserInput — name', () => {
  it('accepts valid name (1-64 chars)', () => {
    expect(() => validateUserInput(valid({ name: 'A' }))).not.toThrow()
  })

  it('rejects too-long name (>64)', () => {
    expect(() => validateUserInput(valid({ name: 'A'.repeat(65) }))).toThrow('name length')
  })
})

// ── 6. Password policy ───────────────────────────────────────────────

describe('validateUserInput — password policy', () => {
  it('rejects short password (<8)', () => {
    expect(() => validateUserInput(valid({ password: 'Mz9Qr7' }))).toThrow('password length')
  })

  it('rejects long password (>128)', () => {
    expect(() => validateUserInput(valid({ password: 'Mz9QrFw2Xk7B'.repeat(11) }))).toThrow('password length')
  })

  it('rejects digits-only password', () => {
    expect(() => validateUserInput(valid({ password: '98765432' }))).toThrow()
  })

  it('rejects letters-only password', () => {
    expect(() => validateUserInput(valid({ password: 'zfmtqwbx' }))).toThrow()
  })

  it('rejects whitespace in password', () => {
    expect(() => validateUserInput(valid({ password: 'Mz9Qr Fw2X' }))).toThrow('whitespace')
  })

  it('rejects password == username', () => {
    expect(() => validateUserInput(valid({ username: 'Mz9QrFw2X', password: 'Mz9QrFw2X' }))).toThrow('password equals username')
  })

  it('rejects password == email', () => {
    expect(() => validateUserInput(valid({ email: 'Zk7m@exa.com', password: 'zk7m@exa.com' }))).toThrow('password equals email')
  })

  const weakPasswords = ['password', 'abcdefgh', 'letmein']
  for (const weak of weakPasswords) {
    it(`rejects weak password: ${weak}`, () => {
      expect(() => validateUserInput(valid({ password: weak }))).toThrow()
    })
  }

  it('rejects repetitive patterns (repeatrepeat)', () => {
    expect(() => validateUserInput(valid({ password: 'repeatrepeat' }))).toThrow()
  })

  it('rejects keyboard patterns (1q2w3e4r)', () => {
    expect(() => validateUserInput(valid({ password: '1q2w3e4r' }))).toThrow()
  })

  it('rejects leet-speak variants (p@ssw0rd)', () => {
    expect(() => validateUserInput(valid({ password: 'p@ssw0rd' }))).toThrow()
  })

  it('rejects context-predictable (user@2024)', () => {
    expect(() => validateUserInput(valid({ password: 'user@2024' }))).toThrow()
  })
})

// ── 7. Injection vectors across all fields ────────────────────────────

describe('validateUserInput — injection rejection', () => {
  const injections: Array<[string, string]> = [
    ['XSS', '<script>alert(1)</script>'],
    ['SQLi', "'; DROP TABLE users; --"],
    ['NoSQL', '{"$ne": ""}'],
    ['Command injection', '; cat /etc/passwd'],
    ['Path traversal', '../../../etc/shadow'],
    ['Null byte', 'test\x00admin'],
    ['Template injection', '${process.env.SECRET}'],
    ['Unicode spoofing', '\u202eadmin'],
  ]

  for (const [label, payload] of injections) {
    it(`rejects ${label} in username`, () => {
      expect(() => validateUserInput(valid({ username: payload }))).toThrow()
    })

    it(`rejects ${label} in name`, () => {
      expect(() => validateUserInput(valid({ name: payload }))).toThrow()
    })
  }
})

// ── 8. Full valid input acceptance ────────────────────────────────────

describe('validateUserInput — valid acceptance', () => {
  it('accepts fully valid input', () => {
    expect(() => validateUserInput(valid())).not.toThrow()
  })

  it('accepts unicode names (Arabic)', () => {
    expect(() => validateUserInput(valid({ name: 'محمد' }))).not.toThrow()
  })

  it('accepts CJK names', () => {
    expect(() => validateUserInput(valid({ name: '张伟' }))).not.toThrow()
  })

  it('accepts accented names', () => {
    expect(() => validateUserInput(valid({ name: 'Françoix' }))).not.toThrow()
  })
})
