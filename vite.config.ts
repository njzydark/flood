import path from 'node:path';

import {lingui} from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  root: 'client/src',
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@client': path.resolve('./client/src/javascript'),
      '@shared': path.resolve('./shared'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['node_modules'],
      },
    },
  },
  plugins: [react(), lingui()],
  server: {
    port: Number(process.env.DEV_SERVER_PORT ?? 4200),
    host: process.env.DEV_SERVER_HOST ?? '0.0.0.0',
    allowedHosts: process.env.DEV_SERVER_ALLOWED_HOSTS?.split(','),
    proxy: {
      '/api': {
        target: process.env.FLOOD_OPTION_PROXY ?? 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../../dist/assets',
    emptyOutDir: true,
    sourcemap: true,
  },
});
