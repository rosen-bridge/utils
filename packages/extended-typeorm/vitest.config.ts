import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['default', 'verbose'],
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'cobertura', 'text', 'text-summary'],
    },
    sequence: {
      concurrent: false,
    },
  },
});
