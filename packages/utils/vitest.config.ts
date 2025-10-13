import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'verbose'],
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'cobertura', 'text', 'text-summary'],
    },
    sequence: {
      concurrent: false,
    },
  },
});
