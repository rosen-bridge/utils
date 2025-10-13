import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
