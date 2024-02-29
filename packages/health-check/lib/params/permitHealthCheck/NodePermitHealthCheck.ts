import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractPermitHealthCheckParam } from './AbstractPermitHealthCheck';

class NodePermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private nodeApi;
  private API_REQUEST_LIMIT = 100;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    networkUrl: string,
    rwtPerCommitment: bigint
  ) {
    super(
      RWT,
      permitAddress,
      WID,
      warnThreshold,
      criticalThreshold,
      rwtPerCommitment
    );
    this.nodeApi = ergoNodeClientFactory(networkUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let RWTCount = 0n;
    let boxes = [],
      offset = 0;
    do {
      boxes = await this.nodeApi.getBoxesByAddressUnspent(this.permitAddress, {
        offset: offset,
        limit: this.API_REQUEST_LIMIT,
      });

      boxes.forEach((box) => {
        const R4 = box.additionalRegisters['R4'];
        if (
          R4 &&
          Buffer.from(
            wasm.Constant.decode_from_base16(R4).to_byte_array()
          ).toString('hex') === this.WID
        ) {
          RWTCount +=
            box.assets?.find((token) => token.tokenId === this.RWT)?.amount ??
            0n;
        }
      });

      offset += this.API_REQUEST_LIMIT;
    } while (boxes.length > 0);

    this.reportsCount = RWTCount / this.rwtPerCommitment;
    this.updateTimeStamp = new Date();
  };
}

export { NodePermitHealthCheckParam };
