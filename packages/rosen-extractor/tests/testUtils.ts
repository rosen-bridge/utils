import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Resolution hook used only in fresh test processes to detect eager crypto. */
const cryptoSentinel = `
export const resolve = async (specifier, context, nextResolve) => {
  const resolved = await nextResolve(specifier, context);
  if (specifier === '@bitauth/libauth' ||
      resolved.url.includes('/libauth/build/lib/crypto/')) {
    throw new Error('BCH_CRYPTO_IMPORT_SENTINEL');
  }
  return resolved;
};
`;

/**
 * Import an entry in a new Node process so prior imports cannot hide side effects.
 * @param entry source file URL or published package entry
 * @param rejectCrypto install a resolver which rejects libauth's root and crypto
 * @returns process output, exit code and any timeout error
 */
export const importEntry = (entry: string, rejectCrypto: boolean) =>
  spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--input-type=module',
      '--eval',
      `
        import { register } from 'node:module';
        ${rejectCrypto ? `register(${JSON.stringify(`data:text/javascript,${encodeURIComponent(cryptoSentinel)}`)}, import.meta.url);` : ''}
        const loaded = await import(${JSON.stringify(entry)});
        console.log(JSON.stringify(Object.keys(loaded).sort()));
      `,
    ],
    {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      encoding: 'utf8',
      timeout: 30_000,
    },
  );
