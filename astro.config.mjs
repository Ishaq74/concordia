// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

import Sonda from 'sonda/astro';

import Icon from 'astro-icon';

let adapter = vercel();
if (process.argv && process.argv.includes('--node')) {
  adapter = node({ mode: 'standalone' });
}

const siteUrl = process.env.SITE || undefined;

export default defineConfig({
  integrations: [
    Icon(),
    Sonda({server: true})
  ],
  output: 'server',
  site: siteUrl,
  base: '/',
  adapter,
  redirects: {
    '/': '/fr/'
  },
  i18n: {
    locales: ['fr', 'en', 'ar', 'es'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: true
    }
  },
  devToolbar: {
    enabled: true
  },
  vite: {
    build: {
    sourcemap: true
    }
  }
});