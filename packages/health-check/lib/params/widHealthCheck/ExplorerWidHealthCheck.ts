import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractWidHealthCheckParam } from './AbstractWidHealthCheck';
import { intersection } from 'lodash-es';

class ExplorerWidHealthCheckParam extends AbstractWidHealthCheckParam {
  private explorerApi;
  private API_REQUEST_LIMIT = 100;

  constructor(
    rwtRepoAddress: string,
    rwtRepoNFT: string,
    address: string,
    networkUrl: string
  ) {
    super(rwtRepoAddress, rwtRepoNFT, address);
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
        this.rwtRepoAddress,
        { offset: offset, limit: this.API_REQUEST_LIMIT }
      );

      // Finding the legit repo box
      const repoBox = boxes.items?.find(
        (box) => (box as any).assets[0].tokenId === this.rwtRepoNft
      );
      if (repoBox) {
        // Extracting WID list
        const widList = wasm.Constant.decode_from_base16(
          (repoBox as any).additionalRegisters['R4'].serializedValue
        )
          .to_js()
          .map((register: Uint8Array) => Buffer.from(register).toString('hex'));
        // Searching for the WID
        const wid = intersection(widList, tokenIdList);
        this.widExists = wid.length > 0;
        break;
      }

      total = boxes.total ?? 0n;
      offset += this.API_REQUEST_LIMIT;
    } while (offset < total);

    this.updateTimeStamp = new Date();
  };
}

export { ExplorerWidHealthCheckParam };
