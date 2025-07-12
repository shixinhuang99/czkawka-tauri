import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
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
    strictPort: false, // 改为false以允许自动尝试其他端口
    host: false,
    hmr: {
      protocol: 'ws',
      port: 4001,
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    PKG_NAME: JSON.stringify(process.env.npm_package_productName || ''),
    PKG_VERSION: JSON.stringify(process.env.npm_package_version || ''),
    REPOSITORY_URL: JSON.stringify(process.env.npm_package_repository_url || ''),
    PLATFORM: JSON.stringify(process.platform),
  },
  build: {
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-icons', '@radix-ui/react-select', '@radix-ui/react-checkbox'],
        },
      },
    },
  },
  base: './',
  esbuild: {
    legalComments: 'none',
    target: 'esnext',
  },
});
