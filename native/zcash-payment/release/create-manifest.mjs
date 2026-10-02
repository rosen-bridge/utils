import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const expectedArtifacts = new Map([
  [
    'rosen-zcash-native-finalizer-x86_64-pc-windows-msvc.exe',
    'x86_64-pc-windows-msvc',
  ],
  [
    'rosen-zcash-native-finalizer-x86_64-unknown-linux-gnu',
    'x86_64-unknown-linux-gnu',
  ],
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || process.argv[index + 1] === undefined)
    throw new Error(`missing ${name}`);
  return process.argv[index + 1];
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function regularFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return Promise.all(
    entries.filter((entry) => entry.isFile()).map(async (entry) => {
      const path = join(directory, entry.name);
      return { name: entry.name, path, bytes: (await stat(path)).size };
    }),
  );
}

const releaseDirectory = resolve(argument('--release-directory'));
const repositoryRoot = resolve(releaseDirectory, '../../..');
const artifactDirectory = resolve(argument('--artifact-directory'));
const tag = argument('--tag');
const rustc = argument('--rustc');
const cargo = argument('--cargo');

if (!/^rosen-zcash-native-finalizer-v\d+\.\d+\.\d+$/.test(tag))
  throw new Error('tag must be rosen-zcash-native-finalizer-v<semver>');

const artifacts = await regularFiles(artifactDirectory);
if (artifacts.length !== expectedArtifacts.size)
  throw new Error('artifact directory has an unexpected file count');

const manifestArtifacts = await Promise.all(
  artifacts.map(async ({ name, path, bytes }) => {
    const target = expectedArtifacts.get(name);
    if (target === undefined) throw new Error(`unexpected artifact ${name}`);
    return {
      file: name,
      target,
      bytes,
      sha256: sha256(await readFile(path)),
    };
  }),
);

const sourceDirectory = join(repositoryRoot, 'native', 'zcash-payment');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
}).trim();
const manifest = {
  name: 'rosen-zcash-native-finalizer',
  version: tag.slice('rosen-zcash-native-finalizer-v'.length),
  source: {
    commit,
    crate: 'native/zcash-payment',
    cargoTomlSha256: sha256(await readFile(join(sourceDirectory, 'Cargo.toml'))),
    cargoLockSha256: sha256(await readFile(join(sourceDirectory, 'Cargo.lock'))),
  },
  build: {
    cargo,
    rustc,
    command: 'cargo build --locked --release',
    pathRemapping: true,
    stripSymbols: true,
  },
  artifacts: manifestArtifacts.sort((left, right) => left.file.localeCompare(right.file)),
};

await writeFile(
  join(artifactDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
const checksums = [...manifest.artifacts]
  .sort((left, right) => left.file.localeCompare(right.file))
  .map((artifact) => `${artifact.sha256}  ${artifact.file}`)
  .join('\n');
await writeFile(join(artifactDirectory, 'SHA256SUMS'), `${checksums}\n`, 'utf8');
