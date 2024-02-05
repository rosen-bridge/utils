import { describe, expect, it, beforeEach, vi } from 'vitest';

import path from 'path';
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'configTestFiles');
process.env['SERVER_PORT'] = '777';
import { vol, fs } from 'memfs';
vi.mock('fs', () => {
  vol.writeFileSync('/file1', '');
  console.log('HERE2');
  return fs;
});
