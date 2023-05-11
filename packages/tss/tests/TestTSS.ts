import { TSS } from '../lib';
import { guardsPrivateKeys } from './testUtils';

class TestTSS extends TSS {
  constructor() {
    super();
  }
  getSignTss = (payload: string) => {
    return this.signTss(payload);
  };
  getCheckTssSign = (payload: string, sign: string, publicKey: string) => {
    return this.checkTssSign(payload, sign, publicKey);
  };

  setPrivateKey = (privateKey: string) => {
    this.privateKey = privateKey;
  };

  getPrivateKey = () => {
    return this.privateKey;
  };
}

export { TestTSS };
