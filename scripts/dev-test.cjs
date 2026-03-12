// Starts the Astro dev server with SMTP_MOCK=1.
// Use `pnpm dev:test` before running integration tests so no real emails are sent.
const { spawn } = require('child_process');

const child = spawn('pnpm', ['astro', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SMTP_MOCK: '1' },
});

child.on('exit', (code) => process.exit(code || 0));
