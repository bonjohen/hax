// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [preact(), sitemap()],
  site: 'https://hax.johnboen.com',
  vite: {
    build: {
      rollupOptions: {
        external: [/pagefind/],
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
