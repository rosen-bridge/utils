import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractWidHealthCheckParam } from './AbstractWidHealthCheck';
import { intersection } from 'lodash-es';

class ExplorerWidHealthCheckParam extends AbstractWidHealthCheckParam {
  private explorerApi;
  private API_REQUEST_LIMIT = 100;

  constructor(
    collateralAddress: string,
    awcNft: string,
    address: string,
    networkUrl: string
  ) {
    super(collateralAddress, awcNft, address);
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * Updates the wid health status and the update timestamp
   */
  update = async () => {
    // Finding all existing tokens for the address
    const assets =
      await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(
        this.address
      );
    const tokenIdList = assets.tokens?.map((token) => token.tokenId);

    let total,
      offset = 0;
    do {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByaddressP1(
        this.collateralAddress,
        { offset: offset, limit: this.API_REQUEST_LIMIT }
      );

      if (!boxes.items)
        throw Error('Bad explorer response, response should have items');

      // Finding the legit repo box
      const collaterals = boxes.items.filter((box) =>
        box.assets && box.assets.length > 0
          ? box.assets[0].tokenId === this.awcNft
          : false
      );
      // Extracting WID list
      const widList = collaterals.map((box) =>
        Buffer.from(
          wasm.Constant.decode_from_base16(
            (box as any).additionalRegisters['R4'].serializedValue
          ).to_byte_array()
        ).toString('hex')
      );

      // Searching for the WID
      const wid = intersection(widList, tokenIdList);
      this.widExists = wid.length > 0;
      // Setting WID count
      if (this.widExists) break;

      total = boxes.total ?? 0n;
      offset += this.API_REQUEST_LIMIT;
    } while (offset < total);

    this.updateTimeStamp = new Date();
  };
}

export { ExplorerWidHealthCheckParam };
