// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import wix from '@wix/astro';
import wixPages from '@wix/astro-pages';
import cloudProviderFetchAdapter from '@wix/cloud-provider-fetch-adapter';
import { FALLBACK_TREATMENTS } from './src/content/fallback-data';
import { CONDITION_CATEGORIES } from './src/content/condition-categories';
const isBuild = process.env.NODE_ENV == "production";

const dynamicPages = [
  ...FALLBACK_TREATMENTS.map(({ slug }) => ({
    path: `/services/${slug}`,
    srcFilePath: '/src/pages/services/[slug].astro',
    static: true,
  })),
  ...CONDITION_CATEGORIES.map(({ slug }) => ({
    path: `/conditions/${slug}`,
    srcFilePath: '/src/pages/conditions/[slug].astro',
    static: true,
  })),
];

// https://astro.build/config
export default defineConfig({
  site: 'https://marin-holy-17907997-marinholyhillacu.wix-site-host.com',
  integrations: [react(), wix(), wixPages({ extendPages: async () => dynamicPages })],
  ...(isBuild && { adapter: cloudProviderFetchAdapter({}) }),

  image: {
    domains: ['static.wixstatic.com']
  },

  output: 'server',
  security: { checkOrigin: false }
});
