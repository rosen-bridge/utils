import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { CollateralBoxBuilder } from '../lib';
import { collateralBoxInfo } from './collateralBoxTestData';

describe('CollateralBoxBuilder', () => {
  let collateralBoxBuilder: CollateralBoxBuilder;

  beforeEach(() => {
    collateralBoxBuilder = new CollateralBoxBuilder(
      collateralBoxInfo.ergoTree,
      collateralBoxInfo.assets[0].tokenId,
      BigInt(
        ergoLib.Constant.decode_from_base16(
          collateralBoxInfo.additionalRegisters.R5.serializedValue,
        )
          .to_i64()
          .to_str(),
      ),
      collateralBoxInfo.assets[1].tokenId,
      BigInt(collateralBoxInfo.assets[1].amount),
      ergoLib.Constant.decode_from_base16(
        collateralBoxInfo.additionalRegisters.R4.serializedValue,
      ).to_byte_array(),
      collateralBoxInfo.value.toString(),
    );
  });

  describe('lockRsn', () => {
    /**
     * @target should increase RSN by the given amount
     * @scenario
     * - store current rsnAmount
     * - call lockRsn with a positive amount
     * @expected
     * - returned value must equal current instance
     * - rsnAmount should increase by the given amount
     */
    it('should increase locked RSN by the given amount', () => {
      const before = collateralBoxBuilder['rsnAmount'];
      const amount = 25n;

      const ret = collateralBoxBuilder.lockRsn(amount);

      expect(ret).toBe(collateralBoxBuilder);
      expect(collateralBoxBuilder['rsnAmount']).toEqual(before + amount);
    });
  });

  describe('unlockRsn', () => {
    /**
     * @target should decrease RSN by the given amount
     * @scenario
     * - store current rsnAmount
     * - call unlockRsn with a valid amount
     * @expected
     * - returned value must equal current instance
     * - rsnAmount should decrease by the given amount
     */
    it('should decrease locked RSN by the given amount', () => {
      const before = collateralBoxBuilder['rsnAmount'];
      const amount = 10n;

      const ret = collateralBoxBuilder.unlockRsn(amount);

      expect(ret).toBe(collateralBoxBuilder);
      expect(collateralBoxBuilder['rsnAmount']).toEqual(before - amount);
    });

    /**
     * @target should throw error when unlocking more RSN than locked
     * @scenario
     * - calculate an amount greater than current rsnTokenAmount
     * - call unlockRsn with that amount
     * @expected
     * - error is thrown
     */
    it('should throw if unlock amount exceeds locked RSN', () => {
      const out = collateralBoxBuilder['rsnAmount'] + 1n;
      expect(() => collateralBoxBuilder.unlockRsn(out)).toThrow();
    });
  });

  describe('build', () => {
    /**
     * @target should create a collateral ErgoBoxCandidate using current builder state
     * @scenario
     * - set value using setValue
     * - set height using setHeight
     * - call build
     * @expected
     * - ergoTree matches collateralErgoTree
     * - value matches set value
     * - creation height matches set height
     * - R4 register equals wid
     * - R5 register equals lockedRsn
     * - first token is AWC NFT with amount 1
     * - second token is RSN with collateralRsn (if > 0)
     */
    it('should create a collateral ErgoBoxCandidate using the current instance properties', () => {
      const height = 5000;

      collateralBoxBuilder.setHeight(height);

      const r4Expected = ergoLib.Constant.from_byte_array(
        collateralBoxBuilder['wid'],
      );
      const r5Expected = ergoLib.Constant.from_i64(
        ergoLib.I64.from_str(collateralBoxBuilder['rsnAmount'].toString()),
      );

      const candidate = collateralBoxBuilder.build();

      expect(candidate.ergo_tree().to_base16_bytes()).toEqual(
        collateralBoxBuilder['collateralErgoTree'],
      );
      expect(candidate.value().as_i64().to_str()).toEqual(
        collateralBoxBuilder['value'].toString(),
      );
      expect(candidate.creation_height()).toEqual(height);

      expect(candidate.register_value(4)?.encode_to_base16()).toEqual(
        r4Expected.encode_to_base16(),
      );
      expect(candidate.register_value(5)?.encode_to_base16()).toEqual(
        r5Expected.encode_to_base16(),
      );

      const tokens = candidate.tokens();
      expect(tokens.get(0).id().to_str()).toEqual(
        collateralBoxBuilder['awcNftId'],
      );
      expect(tokens.get(0).amount().as_i64().to_str()).toEqual('1');

      if (collateralBoxBuilder['collateralRsn'] > 0n) {
        expect(tokens.get(1).id().to_str()).toEqual(
          collateralBoxBuilder['rsnTokenId'],
        );
        expect(tokens.get(1).amount().as_i64().to_str()).toEqual(
          collateralBoxBuilder['collateralRsn'].toString(),
        );
      }
    });
  });
});
