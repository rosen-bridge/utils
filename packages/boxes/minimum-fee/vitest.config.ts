import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['default', 'verbose'],
    environment: 'node',
    deps: {
      inline: [/@rosen-clients\//, /@rosen-bridge\//],
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'cobertura', 'text', 'text-summary'],
      reportsDirectory: './coverage',
    },
    sequence: {
      concurrent: false,
    },
  },
});
