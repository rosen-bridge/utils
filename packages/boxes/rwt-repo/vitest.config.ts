import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: ['cobertura', 'text', 'text-summary'],
    },
    passWithNoTests: true,
  },
});
