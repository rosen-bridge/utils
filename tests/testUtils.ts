import { GuardDetectionConfig, MessageHandler } from '../lib';
import crypto from 'crypto';
import pkg from 'secp256k1';
import { DummyLogger } from '@rosen-bridge/logger-interface';

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
  guardsPublicKey: guardsPublicKeys.slice(1, 4),
  logger: new DummyLogger(),
  publicKey: guardsPublicKeys[0],
};

export { handler, config, guardsPrivateKeys, guardsPublicKeys };
