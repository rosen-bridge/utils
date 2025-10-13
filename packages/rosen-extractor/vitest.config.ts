import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'verbose'],
    environment: 'node',
    deps: {
      inline: [/@rosen-bridge\//, /lodash-es/],
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'cobertura', 'text', 'text-summary'],
    },
    sequence: {
      concurrent: false,
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
