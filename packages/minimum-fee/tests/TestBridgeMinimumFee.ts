import ExplorerApi from '../lib/explorerApi/ExplorerApi';
import { BridgeMinimumFee } from '../lib/bridgeMinimumFee/BridgeMinimumFee';

export class TestBridgeMinimumFee extends BridgeMinimumFee {
  /**
   * initializes class parameters
   * @param explorerBaseUrl base url to explorer api
   * @param feeConfigErgoTreeTemplateHash the ergoTreeTemplateHash of all minimum fee config boxes
   * @param feeConfigTokenId the token id which all minimum fee config boxes contain
   */
  constructor(
    explorerBaseUrl: string,
    feeConfigErgoTreeTemplateHash: string,
    feeConfigTokenId: string
  ) {
    super(explorerBaseUrl, feeConfigErgoTreeTemplateHash, feeConfigTokenId);
  }

  /**
   * returns ExplorerApi
   */
  getExplorer = (): ExplorerApi => {
    return this.explorer;
  };
}
