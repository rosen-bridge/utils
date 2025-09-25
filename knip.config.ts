import path from 'node:path';
import type { KnipConfig } from 'knip';

const packages = path.join(
  path.dirname(import.meta.filename),
  'packages/**/{lib,src,bin}/*.{js,ts}',
);

const config: KnipConfig = {
  $schema: 'https://unpkg.com/knip/schema.json',
  ignore: [
    '**/node_modules/',
    '**/dist/',
    '**/vite.config.ts.timestamp-.+',
    '**/vitest.config.ts.timestamp-.+',
  ],
  ignoreDependencies: [
    '@babel/preset-env',
    '@babel/preset-env',
    '@eslint/js',
    'extensionless',
    'globals',
    'ts-node',
    'tsx',
    'vite-plugin-wasm',
  ],
  entry: [packages],
};

export default config;
