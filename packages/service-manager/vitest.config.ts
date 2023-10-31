import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      reporter: ['cobertura', 'text', 'text-summary'],
    },
    passWithNoTests: true,
    threads: false,
  },
});
