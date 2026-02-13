import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    testTimeout: 60000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
      },
      exclude: ['tests/**', '**/*.d.ts', '**/*.config.*'],
    },
    retry: process.env.CI ? 2 : 0,
    env: {
      NODE_ENV: 'test',
      SMTP_MOCK: '1',
      BETTER_AUTH_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://test:test@localhost/test_db',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@database': path.resolve(__dirname, './src/database'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@templates': path.resolve(__dirname, './src/components/templates'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@api': path.resolve(__dirname, './src/pages/api'),
      '@images': path.resolve(__dirname, './public/images'),
      '@smtp': path.resolve(__dirname, './src/lib/smtp'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})