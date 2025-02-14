import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: '2c-solution',
      project: 'prod-info-system-frontend',
      authToken: process.env.VITE_SENTRY_AUTH_KEY,
      release: {
        name: process.env.VITE_SENTRY_RELEASE_NAME,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    target: 'es2020',
  },
});
