import { TSS } from '../lib';
import { guardsPrivateKeys } from './testUtils';

class TestTSS extends TSS {
  constructor() {
    super();
    this.privateKey = guardsPrivateKeys[0];
  }
  getSignTss = (payload: string) => {
    return this.signTss(payload);
  };
  getCheckTssSign = (payload: string, sign: string, publicKey: string) => {
    return this.checkTssSign(payload, sign, publicKey);
  };

  getPrivateKey = () => {
    return this.privateKey;
  };
}

export { TestTSS };
