import { Address } from 'ergo-lib-wasm-nodejs';
import {
  Fee,
  InvalidConfig,
  MinimumFeeBoxBuilder,
  MinimumFeeConfig,
} from '../lib';

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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
        [700n, 400n, 100n],
        [800n, 500n, 200n],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        [93n, 70n, 30n],
        [96n, 80n, 40n],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          [30n, 3000n],
          [20n, 2000n],
          [10n, 1000n],
        ],
        [
          [31n, 3100n],
          [21n, 2100n],
          [11n, 1100n],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        [60n, 50n, 40n],
        [61n, 51n, 41n],
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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
        [700n, 400n, 100n],
        [800n, 500n, 200n],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        [93n, 70n, 30n],
        [96n, 80n, 40n],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          [30n, 3000n],
          [20n, 2000n],
          [10n, 1000n],
        ],
        [
          [31n, 3100n],
          [21n, 2100n],
          [11n, 1100n],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        [60n, 50n, 40n],
        [61n, 51n, 41n],
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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
        [700n, -1n, 100n],
        [800n, 500n, 200n],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        [93n, -1n, 30n],
        [96n, 80n, 40n],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          [30n, 3000n],
          [-1n, -1n],
          [10n, 1000n],
        ],
        [
          [31n, 3100n],
          [21n, 2100n],
          [11n, 1100n],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        [60n, -1n, 40n],
        [61n, 51n, 41n],
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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
        [700n, 400n, 100n],
        [800n, -1n, 200n],
      ];
      expect(result.register_value(6)?.to_js()).toEqual(expectedBridgeFees);
      const expectedNetworkFees = [
        [93n, 70n, 30n],
        [96n, -1n, 40n],
      ];
      expect(result.register_value(7)?.to_js()).toEqual(expectedNetworkFees);
      const expectedRsnRatios = [
        [
          [30n, 3000n],
          [20n, 2000n],
          [10n, 1000n],
        ],
        [
          [31n, 3100n],
          [-1n, -1n],
          [11n, 1100n],
        ],
      ];
      expect(result.register_value(8)?.to_js()).toEqual(expectedRsnRatios);
      const expectedFeeRatios = [
        [60n, 50n, 40n],
        [61n, -1n, 41n],
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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 555555, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
    it('should throw Error when a config misses a previous chain', () => {
      // mock test data
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 444444, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
      const fees: Array<Fee> = [
        {
          heights: { ergo: 11111, cardano: 555555, binance: 666 },
          configs: {
            ergo: {
              bridgeFee: 100n,
              networkFee: 30n,
              rsnRatio: 10n,
              rsnRatioDivisor: 1000n,
              feeRatio: 40n,
            },
            cardano: {
              bridgeFee: 400n,
              networkFee: 70n,
              rsnRatio: 20n,
              rsnRatioDivisor: 2000n,
              feeRatio: 50n,
            },
            binance: {
              bridgeFee: 700n,
              networkFee: 93n,
              rsnRatio: 30n,
              rsnRatioDivisor: 3000n,
              feeRatio: 60n,
            },
          },
        },
        {
          heights: { ergo: 22222, cardano: 444444, binance: 777 },
          configs: {
            ergo: {
              bridgeFee: 200n,
              networkFee: 40n,
              rsnRatio: 11n,
              rsnRatioDivisor: 1100n,
              feeRatio: 41n,
            },
            cardano: {
              bridgeFee: 500n,
              networkFee: 80n,
              rsnRatio: 21n,
              rsnRatioDivisor: 2100n,
              feeRatio: 51n,
            },
            binance: {
              bridgeFee: 800n,
              networkFee: 96n,
              rsnRatio: 31n,
              rsnRatioDivisor: 3100n,
              feeRatio: 61n,
            },
          },
        },
      ];

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
});
