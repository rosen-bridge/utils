import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractWidHealthCheckParam } from './AbstractWidHealthCheck';
import { intersection } from 'lodash-es';

class NodeWidHealthCheckParam extends AbstractWidHealthCheckParam {
  private nodeApi;
  private API_REQUEST_LIMIT = 100;

  constructor(
    collateralAddress: string,
    awcNft: string,
    address: string,
    networkUrl: string
  ) {
    super(collateralAddress, awcNft, address);
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }
  /**
   * Updates the wid health status and the update timestamp
   */
  update = async () => {
    // Finding all existing tokens for the address
    const assets = await this.nodeApi.getAddressBalanceTotal(this.address);
    const tokenIdList = assets?.confirmed?.tokens.map((token) => token.tokenId);

    let boxes = [],
      offset = 0;
    do {
      boxes = await this.nodeApi.getBoxesByAddressUnspent(
        this.collateralAddress,
        {
          offset: offset,
          limit: this.API_REQUEST_LIMIT,
        }
      );

      const collaterals = boxes?.filter(
        (box) => box.assets?.[0].tokenId === this.awcNft
      );
      // Extracting WID list
      const widList = collaterals.map((box) =>
        Buffer.from(
          wasm.Constant.decode_from_base16(
            box.additionalRegisters['R4']
          ).to_byte_array()
        ).toString('hex')
      );
      // Searching for the WID
      const wid = intersection(widList, tokenIdList);
      this.widExists = wid.length > 0;
      // Setting WID count
      if (this.widExists) break;

      offset += this.API_REQUEST_LIMIT;
    } while (boxes.length > 0);

    this.updateTimeStamp = new Date();
  };
}

export { NodeWidHealthCheckParam };
