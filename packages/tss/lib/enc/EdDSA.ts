import { EncryptionHandler } from '../abstract';
import * as ed from '@noble/ed25519';
import { blake2b } from '@noble/hashes/blake2b';
import { randomBytes } from 'crypto';

ed.etc.sha512Sync = (...m) => blake2b(ed.etc.concatBytes(...m));

class EdDSA extends EncryptionHandler {
  private readonly key: Uint8Array;

  constructor(key: string) {
    super();
    this.key = Uint8Array.from(Buffer.from(key, 'hex'));
  }

  getPk = async () => {
    return Buffer.from(await ed.getPublicKey(this.key)).toString('hex');
  };

  static randomKey = async (): Promise<string> => {
    return randomBytes(32).toString('hex');
  };

  sign = async (message: string): Promise<string> => {
    return Buffer.from(ed.sign(Buffer.from(message), this.key)).toString('hex');
  };

  verify = async (
    message: string,
    signature: string,
    signerPublicKey: string
  ): Promise<boolean> => {
    const msg = Buffer.from(message);
    const sign = Buffer.from(signature, 'hex');
    const publicKey = Buffer.from(signerPublicKey, 'hex');
    return ed.verify(sign, msg, publicKey);
  };
  getCrypto = () => 'eddsa';
}

export { EdDSA };
