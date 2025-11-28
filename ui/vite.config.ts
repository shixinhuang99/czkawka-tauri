import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const { default: pkg } = await import('./package.json');

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '18' }]],
        },
      }),
    ],
    clearScreen: false,
    server: {
      port: 4000,
      strictPort: true,
      host: false,
      hmr: {
        protocol: 'ws',
        port: 4001,
      },
    },
    resolve: {
      alias: {
        '~': path.resolve(import.meta.dirname, 'src'),
      },
    },
    define: {
      PKG_NAME: JSON.stringify(pkg.productName),
      PKG_VERSION: JSON.stringify(pkg.version),
      REPOSITORY_URL: JSON.stringify(pkg.repository.url),
      PLATFORM: JSON.stringify(process.platform),
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
    base: './',
  };
});
