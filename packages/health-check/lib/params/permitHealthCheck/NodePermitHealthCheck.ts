import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractPermitHealthCheckParam } from './AbstractPermitHealthCheck';
import { ErgoTransactionOutput } from '@rosen-clients/ergo-node/dist/src/types/ergoTransactionOutput.d';

class NodePermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private nodeApi;
  private API_REQUEST_LIMIT = 100n;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    networkUrl: string
  ) {
    super(RWT, permitAddress, WID, warnThreshold, criticalThreshold);
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let RWTCount = 0n;
    let boxes = [],
      offset = 0n;
    do {
      boxes = await this.nodeApi.blockchain.getBoxesByAddressUnspent(
        this.permitAddress,
        { offset: offset, limit: this.API_REQUEST_LIMIT }
      );

      boxes.forEach((box) => {
        const R4 = (box as unknown as ErgoTransactionOutput)
          .additionalRegisters['R4'];
        if (
          R4 &&
          Buffer.from(wasm.Constant.decode_from_base16(R4).to_js()[0]).toString(
            'hex'
          ) === this.WID
        ) {
          RWTCount +=
            (box as unknown as ErgoTransactionOutput).assets?.find(
              (token) => token.tokenId === this.RWT
            )?.amount ?? 0n;
        }
      });

      offset += this.API_REQUEST_LIMIT;
    } while (boxes.length > 0);

    this.RWTCount = RWTCount;
    this.updateTimeStamp = new Date();
  };
}

export { NodePermitHealthCheckParam };