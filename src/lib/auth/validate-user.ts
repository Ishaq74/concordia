import validator from 'validator';


const dangerousPatterns = [
  /<script.*?>.*?<\/script>/i, // XSS
  /<.*onerror=.*>/i, // XSS img
  /javascript:/i, // JS URI
  /\$\{.*\}/, // template injection
  /\{\{.*\}\}/, // mustache injection
  /[`]/, // backtick command
  /[;|&$(){}\[\]<>]/, // shell metacharacters
  /&&|\|\||\|/, // shell chaining
  /cat\s+\/etc\/passwd/i, // classic command injection
  /whoami|id|uname|ls|pwd|echo|nc|curl|wget|ping|sleep|base64|bash|sh|zsh|dash|ksh/i, // shell commands
  /\b(select|insert|update|delete|drop|union|--|#)\b/i, // SQL
  /\b(db\.|\$where|\$ne|\$gt|\$lt|\$in|\$nin|\$or|\$and)\b/i, // NoSQL
  /\.\./, // path traversal
  /\x00/, // null byte
  /\u202e|\u202d|\u202c|\u202b|\u202a/, // unicode spoofing
];

const COMBINED_DANGEROUS = new RegExp(
  dangerousPatterns.map(p => `(${p.source})`).join('|'),
  'i'
);

const weakPasswords = [
  'password', '12345678', 'abcdefgh', 'Password1', 'Qwerty123!', 'P@ssw0rd', 'repeatrepeat', 'user@2024',
  'letmein', 'admin', 'welcome', 'monkey', 'dragon', 'football', 'iloveyou', '123456', '123456789', '12345',
  '1234', 'abc123', '1q2w3e4r', 'zaq12wsx', 'password1', 'qwerty', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
];

export function validateUserInput({ email, username, name, password }: { email?: unknown, username?: unknown, name?: unknown, password?: unknown }) {
  // Helper: reject any dangerous pattern (for all fields, only on real strings)
  function rejectDangerous(val: string, label: string) {
    if (COMBINED_DANGEROUS.test(val)) throw new Error(`Validation error: dangerous input in ${label}`);
    // Block stringified objects/arrays (NoSQL)
    if (/^\s*[\{\[]/.test(val.trim())) throw new Error(`Validation error: dangerous NoSQL input in ${label}`);
    // Block if parses as JSON object/array (NoSQL)
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        throw new Error(`Validation error: dangerous NoSQL input in ${label}`);
      }
    } catch {}
    // Block if value is only or starts/ends with shell metacharacters or sequences
    if (/^(;|&&|\||`|\$|\(|\)|\{|\}|\[|\]|<|>|\$\(|\$\{|\$\w+)/.test(val.trim()) || /(;|&&|\||`|\$|\(|\)|\{|\}|\[|\]|<|>|\$\(|\$\{|\$\w+)$/.test(val.trim())) {
      throw new Error(`Validation error: dangerous command injection in ${label}`);
    }
    // Block if value is exactly a shell metacharacter or sequence
    if (/^(;|&&|\||`|\$|\(|\)|\{|\}|\[|\]|<|>|\$\(|\$\{|\$\w+)$/.test(val.trim())) {
      throw new Error(`Validation error: dangerous command injection in ${label}`);
    }
    // Block command injection patterns anywhere
    if (/(;|&&|\||`|\$\(|\$\{|\$\w+|\|\||\|)/.test(val)) throw new Error(`Validation error: dangerous command injection in ${label}`);
    // Block classic shell commands
    if (/cat\s+\/etc\/passwd|whoami|id |uname|ls|pwd|echo|nc|curl|wget|ping|sleep|base64|bash|sh|zsh|dash|ksh/i.test(val)) throw new Error(`Validation error: dangerous shell command in ${label}`);
    // Block SQL/NoSQL keywords
    if (/\b(select|insert|update|delete|drop|union|--|#)\b/i.test(val)) throw new Error(`Validation error: dangerous SQL injection in ${label}`);
    if (/\b(db\.|\$where|\$ne|\$gt|\$lt|\$in|\$nin|\$or|\$and)\b/i.test(val)) throw new Error(`Validation error: dangerous NoSQL input in ${label}`);
    // Block path traversal
    if (/\.\./.test(val)) throw new Error(`Validation error: dangerous path traversal in ${label}`);
    // Block null byte
    if (/\x00/.test(val)) throw new Error(`Validation error: dangerous null byte in ${label}`);
    // Block unicode spoofing
    if (/\u202e|\u202d|\u202c|\u202b|\u202a/.test(val)) throw new Error(`Validation error: dangerous unicode spoofing in ${label}`);
    // Block if value is a stringified primitive but not a plain string (e.g. 'true', 'false', 'null', 'undefined', 'NaN', '[object Object]')
    if (/^(true|false|null|undefined|NaN|\[object Object\])$/i.test(val.trim())) throw new Error(`Validation error: dangerous primitive in ${label}`);
  }

  // Validate all fields strictly
  const fields = [
    { key: 'email', value: email },
    { key: 'username', value: username },
    { key: 'name', value: name },
    { key: 'password', value: password },
  ];
  for (const { key, value } of fields) {
    // Block all non-string, object, array, null, undefined, number, boolean
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'string' ||
      Object.prototype.toString.call(value) !== '[object String]'
    ) {
      throw new Error(`Validation error: invalid input type for ${key}`);
    }
    // Block if value is a real object or array (not stringified)
    if (typeof value === 'object' || Array.isArray(value)) {
      throw new Error(`Validation error: dangerous object/array input in ${key}`);
    }
    const val = value.trim();
    // Block empty string
    if (val.length === 0) throw new Error(`Validation error: empty input for ${key}`);
    // Block stringified objects/arrays (NoSQL)
    if (/^[\{\[]/.test(val)) throw new Error(`Validation error: dangerous NoSQL input in ${key}`);
    // Block if parses as JSON object/array (NoSQL)
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        throw new Error(`Validation error: dangerous NoSQL input in ${key}`);
      }
    } catch {}
    // Block NoSQL keywords
    if (/\$ne|\$gt|\$lt|\$in|\$nin|\$or|\$and|db\.|\$where/.test(val)) {
      throw new Error(`Validation error: dangerous NoSQL input in ${key}`);
    }
    // Block shell metacharacters and command injection (strict, anywhere, even if only whitespace around)
    if (/^(;|&&|\||`|\$|\(|\)|\{|\}|\[|\]|<|>|\$\(|\$\{|\$\w+)$/.test(val) ||
        /(;|&&|\||`|\$|\(|\)|\{|\}|\[|\]|<|>|\$\(|\$\{|\$\w+)/.test(val) ||
        /(;|&&|\||`|\$\(|\$\{|\$\w+|\|\||\|)/.test(val)) {
      throw new Error(`Validation error: dangerous command injection in ${key}`);
    }
    // Block all dangerous patterns (XSS, SQLi, path, unicode, etc.)
    rejectDangerous(val, key);
  }

  // Email
  if (email !== undefined) {
    const val = email as string;
    if (!validator.isEmail(val)) throw new Error('Validation error: invalid email input');
    if (/\u0435/.test(val)) throw new Error('Validation error: dangerous email homograph attack');
  }
  // Username
  if (username !== undefined) {
    const val = username as string;
    if (!validator.isLength(val, { min: 3, max: 32 })) throw new Error('Validation error: invalid username length');
  }
  // Name
  if (name !== undefined) {
    const val = name as string;
    if (!validator.isLength(val, { min: 1, max: 64 })) throw new Error('Validation error: invalid name length');
  }
  // Password
  if (password !== undefined) {
    const val = password as string;
    if (!validator.isLength(val, { min: 8, max: 128 })) throw new Error('Validation error: invalid password length');
    const lower = val.toLowerCase();

    // 1. Block repeated substrings (e.g. repeatrepeat, abcabcabc, ababab, etc.)
    // Detects any substring of 2-6 chars repeated at least twice
    if (/(.{2,6})\1{1,}/i.test(val) || /([a-zA-Z0-9])\1{2,}/.test(val) || /^(.)\1+$/.test(val)) {
      throw new Error('Validation error: repetitive or dangerous password input');
    }

    // 2. Block context predictable passwords like user@2024, username@year, etc.
    if (/user@20\d{2}/i.test(lower)) throw new Error('Validation error: context predictable or dangerous password input');
    const contextPatterns = [
      /^(user|username|admin|test|guest|root)[^a-zA-Z0-9]*(@|\.|-|_)?\d{2,4}$/i, // user@2024, admin-2023, etc.
      /^[a-z]+@[0-9]{4,}$/i, // user@2024
      /^[a-z]+[._-]?[0-9]{4,}$/i, // user.2024, user-2024
      /user\d{2,4}/i,
      /admin\d{2,4}/i,
      /test\d{2,4}/i,
      /guest\d{2,4}/i,
      /root\d{2,4}/i,
      /\d{4,}/, // years or long numbers
    ];
    for (const pat of contextPatterns) {
      if (pat.test(val)) {
        throw new Error('Validation error: context predictable or dangerous password input');
      }
    }

    // 3. Block password == username/email
    if (username && lower === (username as string).toLowerCase()) throw new Error('Validation error: password equals username input');
    if (email && lower === (email as string).toLowerCase()) throw new Error('Validation error: password equals email input');

    // 4. Block common/weak passwords and variants (exhaustive)
    for (const weak of weakPasswords) {
      const weakNorm = weak.replace(/[^a-z0-9]/gi, '');
      if (
        lower.includes(weak) ||
        lower.replace(/[^a-z0-9]/gi, '').includes(weakNorm) ||
        val.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(weakNorm)
      ) {
        throw new Error('Validation error: weak or dangerous password input');
      }
    }

    // 5. Block sequential, keyboard, leet, and simple patterns
    if (/^(?:\d{4,}|[a-z]{4,}|[A-Z]{4,})$/.test(val)) throw new Error('Validation error: sequential or dangerous password input');
    if (/0123456789|abcdefghijklmnopqrstuvwxyz|qwertyuiop|asdfghjkl|zxcvbnm/i.test(val)) throw new Error('Validation error: sequential or dangerous password input');
    if (/qwerty|asdf|zxcvbnm|azerty|1q2w3e4r|zaq12wsx/i.test(lower)) throw new Error('Validation error: keyboard pattern or dangerous password input');
    if (/p@ssw0rd|pa55w0rd|l3tm31n|4dm1n|w3lc0m3/i.test(lower)) throw new Error('Validation error: leet speak or dangerous password input');
    if (/1234|abcd|qwerty|password|letmein|admin|user/i.test(lower)) throw new Error('Validation error: common or dangerous password input');

    // 6. Block whitespace
    if (/\s/.test(val)) throw new Error('Validation error: password contains whitespace');
    // 7. Block only digits or only letters
    if (/^[0-9]+$/.test(val) || /^[a-zA-Z]+$/.test(val)) throw new Error('Validation error: password too simple or dangerous');

    // 8. Block passwords with shell/NoSQL/SQL patterns
    rejectDangerous(val, 'password');
  }
}
