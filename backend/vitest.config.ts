import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    globalSetup: './src/__tests__/setup.ts',
    setupFiles: ['./src/__tests__/workerSetup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'dist/**', 'node_modules/**'],
    },
  },
});
