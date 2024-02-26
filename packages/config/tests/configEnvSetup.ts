import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * sets up environment for config tests
 *
 * @param {Record<string, string>} envVars list of environment variables to be
 * set for tests
 * @return {{
 *   configDir: string;
 * }}
 */
const setupConfigTestEnv = (
  envVars: Record<string, any>
): {
  configDir: string;
} => {
  const configDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `config-${uuidv4()}`)
  );
  process.env['NODE_CONFIG_DIR'] = configDir;
  fs.cpSync(path.join(__dirname, 'configTestFiles'), configDir, {
    recursive: true,
  });

  for (const [name, val] of Object.entries(envVars)) {
    process.env[name] = val;
  }
  return { configDir };
};

export const { configDir } = setupConfigTestEnv({ SERVER_URL: 'some-url.org' });
