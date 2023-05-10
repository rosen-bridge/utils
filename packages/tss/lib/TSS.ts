import { GuardDetection } from './GuardDetection';
import * as ed from '@noble/ed25519';
import { TSSHandler } from './types';

class TSS {
  // protected guardDetection:GuardDetection;
  protected privateKey: string;
  constructor() {
    this.privateKey = 'someprivateKey';
    const tssHandler: TSSHandler = {
      sign: this.signTss,
      verify: this.checkTssSign,
    };
    // this.guardDetection();
  }
  protected signTss = (payload: string) => {
    return Buffer.from(
      ed.sign(
        Uint8Array.from(Buffer.from(payload, 'hex')),
        Uint8Array.from(Buffer.from(this.privateKey, 'hex'))
      )
    ).toString('hex');
  };

  protected checkTssSign = (
    payload: string,
    sign: string,
    publicKey: string
  ) => {
    return ed.verify(
      Uint8Array.from(Buffer.from(sign, 'hex')),
      Uint8Array.from(Buffer.from(payload, 'hex')),
      Uint8Array.from(Buffer.from(publicKey, 'hex'))
    );
  };
}

export { TSS };
