import * as ed from '@noble/ed25519';
import { TSSHandler } from './types';

class TSS {
  // protected guardDetection:GuardDetection;
  protected privateKey: string;
  constructor() {
    this.privateKey = '';
    const tssHandler: TSSHandler = {
      sign: this.signTss,
      verify: this.checkTssSign,
    };
    // this.guardDetection();
  }
  protected signTss = async (payload: string) => {
    return Buffer.from(await ed.signAsync(payload, this.privateKey)).toString(
      'hex'
    );
  };

  protected checkTssSign = async (
    payload: string,
    sign: string,
    publicKey: string
  ) => {
    return await ed.verifyAsync(sign, payload, publicKey);
  };
}

export { TSS };
