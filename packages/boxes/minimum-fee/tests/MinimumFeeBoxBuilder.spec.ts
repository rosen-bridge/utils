import { Address } from 'ergo-lib-wasm-nodejs';
import { InvalidConfig, MinimumFeeBoxBuilder, MinimumFeeConfig } from '../lib';
import * as testData from './testData';

describe('MinimumFeeBoxBuilder', () => {
  const defaultValue = 100000000n;
  const defaultHeight = 445000;
  const defaultTokenId = 'erg';
  const defaultMinimumFeeNFT =
    '07875cd69c5e262622a7a7c593a5fda566cabf2ebe41709faede7b1fd518862b';
  const defaultAddress = '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U';

  describe('build', () => {
    /**
     * @target MinimumFeeBoxBuilder.build should build expected
     * config box with normal config for Erg successfully
     * @dependencies
     * @scenario
     * - mock test data
     * - run test
     * - check returned value
     * @expected
     * - generated box should
     * -   have expected value
     * -   have expected height
     * -   have expected address
     * -   have only MinimumFeeNFT token
     * -   have correct register values
     */
    it('should build expected config box with normal config for Erg successfully', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // run test
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));
      const result = builder.build();

      // check returned value
      expect(result.value().as_i64().to_str()).toEqual(defaultValue.toString());
      expect(result.creation_height()).toEqual(defaultHeight);
      expect(result.ergo_tree().to_base16_bytes()).toEqual(
        Address.from_base58(defaultAddress).to_ergo_tree().to_base16_bytes()
      );
      expect(result.tokens().len()).toEqual(1);
      expect(result.tokens().get(0).id().to_str()).toEqual(
        defaultMinimumFeeNFT
      );
      expect(result.tokens().get(0).amount().as_i64().to_str()).toEqual('1');
      const expectedChains = ['binance', 'cardano', 'ergo'];
      expect(
        result
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(expectedChains);
      const expectedHeights = [
        [666, 444444, 11111],
        [777, 555555, 22222],
      ];
      expect(result.register_value(5)?.to_js()).toEqual(expectedHeights);
      const expectedBridgeFees = [
        ['700', '400', '100'],
        ['800', '500', '200'],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        ['93', '70', '30'],
        ['96', '80', '40'],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          ['30', '3000'],
          ['20', '2000'],
          ['10', '1000'],
        ],
        [
          ['31', '3100'],
          ['21', '2100'],
          ['11', '1100'],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        ['60', '50', '40'],
        ['61', '51', '41'],
      ];
      expect(result.register_value(9)?.to_js()).toEqual(expectedFeeRatios);
    });

    /**
     * @target MinimumFeeBoxBuilder.build should build expected
     * config box with normal config for a token successfully
     * @dependencies
     * @scenario
     * - mock test data
     * - run test
     * - check returned value
     * @expected
     * - generated box should
     * -   have expected value
     * -   have expected height
     * -   have expected address
     * -   have two tokens (MinimumFeeNFT and given token)
     * -   have correct register values
     */
    it('should build expected config box with normal config for a token successfully', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });
      const tokenId =
        'a4b306de44e3137609405ceab1283255c83061e2c52338e6829101a07ddddefb';

      // run test
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(tokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));
      const result = builder.build();

      // check returned value
      expect(result.value().as_i64().to_str()).toEqual(defaultValue.toString());
      expect(result.creation_height()).toEqual(defaultHeight);
      expect(result.ergo_tree().to_base16_bytes()).toEqual(
        Address.from_base58(defaultAddress).to_ergo_tree().to_base16_bytes()
      );
      expect(result.tokens().len()).toEqual(2);
      expect(result.tokens().get(0).id().to_str()).toEqual(
        defaultMinimumFeeNFT
      );
      expect(result.tokens().get(0).amount().as_i64().to_str()).toEqual('1');
      expect(result.tokens().get(1).id().to_str()).toEqual(tokenId);
      expect(result.tokens().get(1).amount().as_i64().to_str()).toEqual('1');
      const expectedChains = ['binance', 'cardano', 'ergo'];
      expect(
        result
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(expectedChains);
      const expectedHeights = [
        [666, 444444, 11111],
        [777, 555555, 22222],
      ];
      expect(result.register_value(5)?.to_js()).toEqual(expectedHeights);
      const expectedBridgeFees = [
        ['700', '400', '100'],
        ['800', '500', '200'],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        ['93', '70', '30'],
        ['96', '80', '40'],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          ['30', '3000'],
          ['20', '2000'],
          ['10', '1000'],
        ],
        [
          ['31', '3100'],
          ['21', '2100'],
          ['11', '1100'],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        ['60', '50', '40'],
        ['61', '51', '41'],
      ];
      expect(result.register_value(9)?.to_js()).toEqual(expectedFeeRatios);
    });

    /**
     * @target MinimumFeeBoxBuilder.build should build expected
     * config box representing config for adding new chain successfully
     * @dependencies
     * @scenario
     * - mock test data (second config should have additional chain)
     * - run test
     * - check returned value
     * @expected
     * - generated box should
     * -   have expected value
     * -   have expected height
     * -   have expected address
     * -   have only MinimumFeeNFT token
     * -   have correct register values
     */
    it('should build expected config box representing config for adding new chain successfully', () => {
      // mock test data
      const fees = testData.newChainFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // run test
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));
      const result = builder.build();

      // check returned value
      expect(result.value().as_i64().to_str()).toEqual(defaultValue.toString());
      expect(result.creation_height()).toEqual(defaultHeight);
      expect(result.ergo_tree().to_base16_bytes()).toEqual(
        Address.from_base58(defaultAddress).to_ergo_tree().to_base16_bytes()
      );
      expect(result.tokens().len()).toEqual(1);
      expect(result.tokens().get(0).id().to_str()).toEqual(
        defaultMinimumFeeNFT
      );
      expect(result.tokens().get(0).amount().as_i64().to_str()).toEqual('1');
      const expectedChains = ['binance', 'cardano', 'ergo'];
      expect(
        result
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(expectedChains);
      const expectedHeights = [
        [666, -1, 11111],
        [777, 555555, 22222],
      ];
      expect(result.register_value(5)?.to_js()).toEqual(expectedHeights);
      const expectedBridgeFees = [
        ['700', '-1', '100'],
        ['800', '500', '200'],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        ['93', '-1', '30'],
        ['96', '80', '40'],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          ['30', '3000'],
          ['-1', '-1'],
          ['10', '1000'],
        ],
        [
          ['31', '3100'],
          ['21', '2100'],
          ['11', '1100'],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        ['60', '-1', '40'],
        ['61', '51', '41'],
      ];
      expect(result.register_value(9)?.to_js()).toEqual(expectedFeeRatios);
    });

    /**
     * @target MinimumFeeBoxBuilder.build should build expected
     * config box representing config for removing new chain successfully
     * @dependencies
     * @scenario
     * - mock test data (second config should have less chains)
     * - run test
     * - check returned value
     * @expected
     * - generated box should
     * -   have expected value
     * -   have expected height
     * -   have expected address
     * -   have only MinimumFeeNFT token
     * -   have correct register values
     */
    it('should build expected config box representing config for removing new chain successfully', () => {
      // mock test data
      const fees = testData.removeChainFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // run test
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));
      const result = builder.build();

      // check returned value
      expect(result.value().as_i64().to_str()).toEqual(defaultValue.toString());
      expect(result.creation_height()).toEqual(defaultHeight);
      expect(result.ergo_tree().to_base16_bytes()).toEqual(
        Address.from_base58(defaultAddress).to_ergo_tree().to_base16_bytes()
      );
      expect(result.tokens().len()).toEqual(1);
      expect(result.tokens().get(0).id().to_str()).toEqual(
        defaultMinimumFeeNFT
      );
      expect(result.tokens().get(0).amount().as_i64().to_str()).toEqual('1');
      const expectedChains = ['binance', 'cardano', 'ergo'];
      expect(
        result
          .register_value(4)
          ?.to_coll_coll_byte()
          .map((element) => Buffer.from(element).toString())
      ).toEqual(expectedChains);
      const expectedHeights = [
        [666, 444444, 11111],
        [777, 555555, 22222],
      ];
      expect(result.register_value(5)?.to_js()).toEqual(expectedHeights);
      const expectedBridgeFees = [
        ['700', '400', '100'],
        ['800', '-1', '200'],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        ['93', '70', '30'],
        ['96', '-1', '40'],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          ['30', '3000'],
          ['20', '2000'],
          ['10', '1000'],
        ],
        [
          ['31', '3100'],
          ['-1', '-1'],
          ['11', '1100'],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        ['60', '50', '40'],
        ['61', '-1', '41'],
      ];
      expect(result.register_value(9)?.to_js()).toEqual(expectedFeeRatios);
    });
  });

  describe('setValue', () => {
    /**
     * @target MinimumFeeBoxBuilder.setValue should throw Error when
     * given value is invalid
     * @dependencies
     * @scenario
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when given value is invalid', () => {
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      );
      expect(() => {
        builder.setValue(1n);
      }).toThrow();
    });
  });

  describe('validate', () => {
    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * box value is not given
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except value)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when box value is not given', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });

    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * box height is not given
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except height)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when box height is not given', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });

    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * token is not given
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except token)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when token is not given', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight);
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });

    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * fee config is not given
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except fee configs)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when fee config is not given', () => {
      // mock test data
      const fees = testData.normalFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });

    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * a config misses a previous chain
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except value)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when a config misses a previous chai', () => {
      // mock test data
      const fees = testData.missPreviousChainFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });

    /**
     * @target MinimumFeeBoxBuilder.validate should throw Error when
     * heights are not ascending
     * @dependencies
     * @scenario
     * - mock test data
     * - build builder and set arguments (except value)
     * - run test & check thrown exception
     * @expected
     * - should throw Error
     */
    it('should throw Error when heights are not ascending', () => {
      // mock test data
      const fees = testData.nonAscendingHeightsFee;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // build builder and set arguments (except value)
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      )
        .setValue(defaultValue)
        .setHeight(defaultHeight)
        .setToken(defaultTokenId);
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test & check thrown exception
      expect(() => {
        builder.build();
      }).toThrow(InvalidConfig);
    });
  });

  describe('removeConfig', () => {
    /**
     * @target MinimumFeeBoxBuilder.removeConfig should remove
     * given index successfully
     * @dependencies
     * @scenario
     * - mock test data
     * - create builder and set configs
     * - run test
     * - check fees in builder
     * @expected
     * - only given index should be removed
     */
    it('should throw Error when box value is not given', () => {
      // mock test data
      const fees = testData.normalFeeWith4Fees;

      const feeConfig: Array<MinimumFeeConfig> = [];
      fees.forEach((fee) => {
        const minimumFeeConfig = new MinimumFeeConfig();
        Object.keys(fee.heights).forEach((chain) =>
          minimumFeeConfig.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          )
        );
        feeConfig.push(minimumFeeConfig);
      });

      // create builder and set configs
      const builder = new MinimumFeeBoxBuilder(
        defaultMinimumFeeNFT,
        defaultAddress
      );
      feeConfig.forEach((fee) => builder.addConfig(fee));

      // run test
      builder.removeConfig(1);

      // check fees in builder
      expect((builder as any).fees).toEqual([fees[0], ...fees.slice(2)]);
    });
  });
});
