module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // prevent accidental direct usage of SMTP or PG client in application code
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'nodemailer',
            message:
              'Import the project SMTP wrapper (`@lib/smtp/smtp`). Do not use `nodemailer` directly; it is mocked in tests.',
          },
          {
            name: 'pg',
            message:
              'Do not instantiate a raw PG Client; use `getDrizzle()` or the test helper `getTestDb()` to obtain a connection.',
          },
        ],
      },
    ],
  },
};