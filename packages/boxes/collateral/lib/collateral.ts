import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { CollateralBoxBuilder } from './collateralBuilder';

export class CollateralBox {
  private readonly wid: Uint8Array;
  private readonly rsnAmount: bigint;

  constructor(
    protected box: ergoLib.ErgoBox,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    try {
      const widReg = this.box.register_value(4);
      if (!widReg) {
        throw new Error('missing R4 register');
      }
      this.wid = widReg.to_byte_array();

      const rsnAmount = this.box.register_value(5);
      if (!rsnAmount) {
        throw new Error('missing R5 register');
      }
      this.rsnAmount = BigInt(rsnAmount.to_i64().to_str());

      if (this.box.tokens().len() < 1) {
        throw new Error('expected at least 1 token (X-AWC NFT)');
      }

      this.logger.debug(
        `CollateralBox wid=[${Buffer.from(this.wid).toString(
          'hex',
        )}] Rsn=[${this.rsnAmount}]`,
      );
    } catch (e) {
      throw Error(`Failed to create CollateralBox: ${e}`);
    }
  }
  /**
   * Creates an instance of CollateralBoxBuilder using current instance's
   *  properties
   *
   * @return {CollateralBoxBuilder}
   */
  toBuilder = (): CollateralBoxBuilder => {
    return new CollateralBoxBuilder(
      this.getErgoTree(),
      this.getAwcNftId(),
      this.getRsnAmount(),
      this.getRsnId(),
      this.getCollateralRsnAmount(),
      this.wid,
      this.getCollateralValue(),
      this.logger,
    );
  };

  /**
   * @returns ErgoTree of the box
   */
  getErgoTree = (): string => {
    return this.box.ergo_tree().to_base16_bytes();
  };
  /**
   * @returns Owner WID extracted from R4
   */
  getOwnerWid = (): Uint8Array => {
    return this.wid;
  };

  /**
   * @returns RSN amount stored in R5
   */
  getRsnAmount = (): bigint => {
    return this.rsnAmount;
  };

  /**
   * @returns collateral box value
   */
  getCollateralValue = (): string => {
    return this.box.value().as_i64().to_str();
  };
  /**
   * @returns X-AWC NFT token ID
   */
  getAwcNftId = (): string => {
    return this.box.tokens().get(0).id().to_str();
  };

  /**
   * getRsnId() Returns the RSN token ID if present in the box; otherwise returns `undefined`.
   *
   * @returns {string} RSN token ID | undefined
   */
  getRsnId = (): string | undefined => {
    if (this.box.tokens().len() < 2) return undefined;
    return this.box.tokens().get(1).id().to_str();
  };
  /**
   * @returns Amount of RSN tokens locked in the box as collateral
   */
  getCollateralRsnAmount = (): bigint => {
    if (this.box.tokens().len() < 2) return 0n;
    return BigInt(this.box.tokens().get(1).amount().as_i64().to_str());
  };
}
