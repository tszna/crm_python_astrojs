import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
  pageExtensions: ['astro', 'md', 'jsx', 'tsx'],
  integrations: [react()],
  vite: {
    server: {
      fs: {
        allow: [
          './',
          path.resolve('../node_modules'),
          path.resolve('../node_modules/astro/dist/runtime/client'),
        ]
      }
    }
  }
});