import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { AbstractPermitHealthCheckParam } from './AbstractPermitHealthCheck';

class ExplorerPermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private explorerApi;
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
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let RWTCount = 0n;
    let total,
      offset = 0;
    do {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByaddressP1(
        this.permitAddress,
        { offset: offset, limit: this.API_REQUEST_LIMIT }
      );

      boxes.items?.forEach((box) => {
        const R4 = (box as any).additionalRegisters['R4'];
        if (
          R4 &&
          Buffer.from(
            wasm.Constant.decode_from_base16(R4.serializedValue).to_js()[0]
          ).toString('hex') === this.WID
        ) {
          RWTCount +=
            box.assets?.find((token) => token.tokenId === this.RWT)?.amount ??
            0n;
        }
      });

      total = boxes.total ?? 0n;
      offset += this.API_REQUEST_LIMIT;
    } while (offset < total);
    this.reportsCount = RWTCount / this.rwtPerCommitment;
    this.updateTimeStamp = new Date();
  };
}

export { ExplorerPermitHealthCheckParam };
