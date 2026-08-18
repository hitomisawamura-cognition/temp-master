import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// バックエンドが同一オリジンで static/ から配信するため base はルート固定
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
