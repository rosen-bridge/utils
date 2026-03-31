import { Constant } from 'ergo-lib-wasm-nodejs';

import { AdditionalRegisters } from '@rosen-bridge/minimum-fee';

import * as testData from './testData';
import { TestExtendedMinimumFeeBox } from './testExtendedMinimumFeeBox';
import TestNetwork from './testNetwork.mock';

describe('ExtendedMinimumFeeBox', () => {
  const nativeTokenId = 'erg';
  const defaultMinimumFeeNFT =
    'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
  const testNetwork = new TestNetwork();

  const generateDefaultExtendedMinimumFeeBox = () =>
    new TestExtendedMinimumFeeBox(
      nativeTokenId,
      defaultMinimumFeeNFT,
      testNetwork,
    );

  describe('toBuilder', () => {
    /**
     * @target ExtendedMinimumFeeBox.toBuilder should return a builder
     * with the same parameters
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - set height for returned value and build it
     * - check box parameters
     * @expected
     * - box parameters should be identical
     *   - value
     *   - address
     *   - tokens
     *   - registers
     */
    it('should return a builder with the same parameters', () => {
      const minimumFeeBox = generateDefaultExtendedMinimumFeeBox();
      const testBox = testData.tokenNormalFeeBox;
      minimumFeeBox.setBox(testBox);
      const result = minimumFeeBox.toBuilder();
      result.setHeight(1000000);
      const resultBoxCandidate = result.build();

      expect(resultBoxCandidate.value().as_i64().to_str()).toEqual(
        testBox.value.toString(),
      );
      expect(resultBoxCandidate.ergo_tree().to_base16_bytes()).toEqual(
        testBox.ergoTree,
      );
      expect(resultBoxCandidate.tokens().len()).toEqual(
        resultBoxCandidate.tokens().len(),
      );
      for (let i = 0; i < resultBoxCandidate.tokens().len(); i++) {
        expect(resultBoxCandidate.tokens().get(i).id().to_str()).toEqual(
          testBox.assets[i].tokenId,
        );
        expect(
          resultBoxCandidate.tokens().get(i).amount().as_i64().to_str(),
        ).toEqual(testBox.assets[i].amount.toString());
      }

      expect(
        resultBoxCandidate
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString()),
      ).toEqual(
        Constant.decode_from_base16(testBox.additionalRegisters!.R4!)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString()),
      );
      for (let i = 5; i < 10; i++) {
        expect(resultBoxCandidate.register_value(i)?.to_js()).toEqual(
          Constant.decode_from_base16(
            testBox.additionalRegisters![`R${i}` as keyof AdditionalRegisters]!,
          )?.to_js(),
        );
      }
    });

    /**
     * @target ExtendedMinimumFeeBox.toBuilder should return a builder
     * with the same parameters with a config that removes a chain
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with remove chain fee
     * - run test
     * - set height for returned value and build it
     * - check box parameters
     * @expected
     * - box parameters should be identical
     *   - value
     *   - address
     *   - tokens
     *   - registers
     */
    it('should return a builder with the same parameters with a config that removes a chain', () => {
      const minimumFeeBox = generateDefaultExtendedMinimumFeeBox();
      const testBox = testData.removeChainFeeBox;
      minimumFeeBox.setBox(testBox);
      const result = minimumFeeBox.toBuilder();
      result.setHeight(1000000);
      const resultBoxCandidate = result.build();

      expect(resultBoxCandidate.value().as_i64().to_str()).toEqual(
        testBox.value.toString(),
      );
      expect(resultBoxCandidate.ergo_tree().to_base16_bytes()).toEqual(
        testBox.ergoTree,
      );
      expect(resultBoxCandidate.tokens().len()).toEqual(
        resultBoxCandidate.tokens().len(),
      );
      for (let i = 0; i < resultBoxCandidate.tokens().len(); i++) {
        expect(resultBoxCandidate.tokens().get(i).id().to_str()).toEqual(
          testBox.assets[i].tokenId,
        );
        expect(
          resultBoxCandidate.tokens().get(i).amount().as_i64().to_str(),
        ).toEqual(testBox.assets[i].amount.toString());
      }

      expect(
        resultBoxCandidate
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString()),
      ).toEqual(
        Constant.decode_from_base16(testBox.additionalRegisters!.R4!)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString()),
      );
      for (let i = 5; i < 10; i++) {
        expect(resultBoxCandidate.register_value(i)?.to_js()).toEqual(
          Constant.decode_from_base16(
            testBox.additionalRegisters![`R${i}` as keyof AdditionalRegisters]!,
          )?.to_js(),
        );
      }
    });

    /**
     * @target ExtendedMinimumFeeBox.toBuilder should not set height
     * for builder
     * @dependencies
     * @scenario
     * - mock object box with an ErgoBox with normal fee
     * - run test
     * - check returned value
     * @expected
     * - height of returned builder should be undefined
     */
    it('should not set height for builder', () => {
      const minimumFeeBox = generateDefaultExtendedMinimumFeeBox();
      minimumFeeBox.setBox(testData.normalFeeBox);
      const result = minimumFeeBox.toBuilder();
      expect((result as any).height).toBeUndefined();
    });
  });
});
