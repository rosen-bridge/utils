import { GuardDetectionConfig, MessageHandler } from '../lib';
import crypto from 'crypto';
import pkg from 'secp256k1';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import { TSSHandler } from '../lib/types';

/**
 * Generate 4 random private keys
 */
const guardsPrivateKeys = Array.from({ length: 4 }, () =>
  crypto.randomBytes(32).toString('hex')
);

/**
 * Generate public keys from private keys in ed25519 format
 */
const guardsPublicKeys = guardsPrivateKeys.map((privateKey) =>
  Buffer.from(
    pkg.publicKeyCreate(Buffer.from(privateKey, 'hex'), false)
  ).toString('hex')
);

/**
 * Mocked handler for testing
 */
const handler: MessageHandler = {
  checkSign: (message, signature, signerPublicKey) => {
    return signature === 'signature';
  },
  decrypt: (message) => {
    return message;
  },
  encrypt: (message) => {
    return message;
  },
  send: () => {
    return new Promise((resolve) => {
      resolve();
    });
  },
  sign: (message) => {
    return 'signature';
  },
};

/**
 * Mocked config for testing
 */
const config: GuardDetectionConfig = {
  index: 0,
  minimumSigner: 2,
  privateKey: guardsPrivateKeys[0],
  guardsPublicKey: guardsPublicKeys.slice(1, 4),
  logger: new DummyLogger(),
  publicKey: guardsPublicKeys[0],
};

const tssHandler: TSSHandler = {
  sign: () => {
    return Promise.resolve('signature');
  },
  verify: () => {
    return Promise.resolve(true);
  },
};

const randomPrivateKey1 =
  '6e329bc3f47698036365e09441b4b59e71903eb471b7f0b6b2f31b1da44ec096';
const randomPrivateKey2 =
  '4aa6485a116b1c9e4b48cf2366f2c0142cd71ea72c3799152de1ef9d7e96ec93';

export {
  handler,
  config,
  guardsPrivateKeys,
  guardsPublicKeys,
  tssHandler,
  randomPrivateKey2,
  randomPrivateKey1,
};
