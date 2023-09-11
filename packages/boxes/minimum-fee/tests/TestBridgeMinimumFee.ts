import { BridgeMinimumFee } from '../lib';

export class TestBridgeMinimumFee extends BridgeMinimumFee {
  /**
   * initializes class parameters
   * @param explorerBaseUrl base url to explorer api
   * @param feeConfigTokenId the token id which all minimum fee config boxes contain
   */
  constructor(explorerBaseUrl: string, feeConfigTokenId: string) {
    super(explorerBaseUrl, feeConfigTokenId);
  }

  /**
   * returns explorer client
   */
  getExplorer = () => {
    return this.explorerClient;
  };
}
