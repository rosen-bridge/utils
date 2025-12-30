import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class CollateralBox {
  private readonly ownerWid: Uint8Array;
  private readonly lockedRsn: bigint;

  constructor(
    protected box: ergoLib.ErgoBox,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    try {
      const widReg = this.box.register_value(4);
      if (!widReg) {
        throw new Error('Invalid Collateral box: missing R4 register (WID)');
      }
      this.ownerWid = widReg.to_byte_array();

      const lockedRsnReg = this.box.register_value(5);
      if (!lockedRsnReg) {
        throw new Error(
          'Invalid Collateral box: missing R5 register (locked RSN)',
        );
      }
      this.lockedRsn = BigInt(lockedRsnReg.to_i64().to_str());

      // --- Tokens ---
      if (this.box.tokens().len() < 1) {
        throw new Error(
          'Invalid Collateral box: expected at least 1 token (X-AWC NFT)',
        );
      }

      this.logger.debug(
        `CollateralBox created wid=[${Buffer.from(this.ownerWid).toString(
          'hex',
        )}] lockedRsn=[${this.lockedRsn}]`,
      );
    } catch (e) {
      throw Error(`Failed to create CollateralBox: ${e}`);
    }
  }

  getErgoTree = (): string => {
    return this.box.ergo_tree().to_base16_bytes();
  };

  getOwnerWid = (): Uint8Array => {
    return this.ownerWid;
  };

  getLockedRsn = (): bigint => {
    return this.lockedRsn;
  };

  getAwcNftId = (): string => {
    return this.box.tokens().get(0).id().to_str();
  };

  getRsnId = (): string | null => {
    if (this.box.tokens().len() < 2) return null;
    return this.box.tokens().get(1).id().to_str();
  };

  getRsnAmount = (): bigint => {
    if (this.box.tokens().len() < 2) return 0n;
    return BigInt(this.box.tokens().get(1).amount().as_i64().to_str());
  };
}
