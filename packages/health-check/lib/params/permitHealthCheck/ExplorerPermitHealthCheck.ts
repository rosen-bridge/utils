import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types/outputInfo.d';
import { AbstractPermitHealthCheckParam } from './AbstractPermitHealthCheck';

class ExplorerPermitHealthCheckParam extends AbstractPermitHealthCheckParam {
  private explorerApi;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    networkUrl: string
  ) {
    super(RWT, permitAddress, WID, warnThreshold, criticalThreshold);
    this.explorerApi = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let RWTCount = 0n;
    let total = 1n,
      offset = 0n;
    while (offset < total) {
      const boxes = await this.explorerApi.v1.getApiV1BoxesUnspentByaddressP1(
        this.permitAddress,
        { offset: offset, limit: 100n }
      );
      total = boxes.total ?? 0n;
      offset += 100n;
      const relatedBoxes = boxes.items?.filter(
        (box) =>
          (box as any).additionalRegisters['R4'] &&
          Buffer.from(
            wasm.Constant.decode_from_base16(
              (box as any).additionalRegisters['R4'].serializedValue
            ).to_js()[0]
          ).toString('hex') == this.WID
      );
      RWTCount +=
        relatedBoxes?.reduce(
          (x, box) =>
            x +
            ((box as unknown as OutputInfo).assets?.find(
              (token) => token.tokenId == this.RWT
            )?.amount ?? 0n),
          0n
        ) ?? 0n;
    }
    this.RWTCount = RWTCount;
    this.updateTimeStamp = new Date();
  };
}

export { ExplorerPermitHealthCheckParam };
