#!/usr/bin/env -S node --experimental-specifier-resolution=node

import { execSync } from 'child_process';

let argv = process.argv.slice(2).join(' ');

try {
  execSync(`typeorm ${argv}`, {
    stdio: 'inherit',
  });
} catch (error) {
  process.exit((error as unknown as { status?: number }).status || 1);
}
