import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractPermitHealthCheckParam } from './AbstractPermitHealthCheck';
import { ErgoTransactionOutput } from '@rosen-clients/ergo-node/dist/src/types/ergoTransactionOutput.d';

class NodePermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private nodeApi;

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
        { offset: offset, limit: 100n }
      );
      const relatedBoxes = boxes.filter(
        (box) =>
          Buffer.from(
            wasm.Constant.decode_from_base16(
              (box as unknown as ErgoTransactionOutput).additionalRegisters[
                'R4'
              ]
            ).to_js()[0]
          ).toString('hex') == this.WID
      );
      RWTCount +=
        relatedBoxes?.reduce(
          (x, box) =>
            x +
            ((box as unknown as ErgoTransactionOutput).assets?.find(
              (token) => token.tokenId == this.RWT
            )?.amount ?? 0n),
          0n
        ) ?? 0n;

      offset += 100n;
    } while (boxes.length > 0);

    this.RWTCount = RWTCount;
    this.updateTimeStamp = new Date();
  };
}

export { NodePermitHealthCheckParam };
