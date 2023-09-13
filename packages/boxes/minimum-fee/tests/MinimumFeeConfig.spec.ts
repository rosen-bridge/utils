import { ChainFee, MinimumFeeConfig } from '../lib';

describe('MinimumFeeConfig', () => {
  describe('addChainConfig', () => {
    /**
     * @target MinimumFeeConfig.addChainConfig should add chain with config successfully
     * @dependencies
     * @scenario
     * - mock test data
     * - run test
     * - check returned value
     * @expected
     * - returned object should contain both height and config of new chain
     */
    it('should add chain with config successfully', () => {
      const chain = 'chain';
      const height = 5000;
      const chainFee: ChainFee = {
        bridgeFee: 100n,
        networkFee: 101n,
        rsnRatio: 102n,
        rsnRatioDivisor: 103n,
        feeRatio: 104n,
      };

      const minimumFeeConfig = new MinimumFeeConfig();
      const result = minimumFeeConfig.addChainConfig(chain, height, chainFee);

      expect(result.getConfig().heights[chain]).toEqual(height);
      expect(result.getConfig().configs[chain]).toEqual(chainFee);
    });

    /**
     * @target MinimumFeeConfig.addChainConfig should add chain WITHOUT config successfully
     * @dependencies
     * @scenario
     * - mock test data
     * - run test
     * - check returned value
     * @expected
     * - returned object should contain only height for new chain
     */
    it('should add chain WITHOUT config successfully', () => {
      const chain = 'chain';
      const height = 5000;

      const minimumFeeConfig = new MinimumFeeConfig();
      const result = minimumFeeConfig.addChainConfig(chain, height, undefined);

      expect(result.getConfig().heights[chain]).toEqual(height);
      expect(result.getConfig().configs[chain]).toBeUndefined();
    });
  });

  describe('removeChainConfig', () => {
    /**
     * @target MinimumFeeConfig.removeChainConfig should remove chain with config successfully
     * @dependencies
     * @scenario
     * - mock test data (add config for two chain)
     * - run test
     * - check returned value
     * @expected
     * - returned object should NOT contain height and config of target chain
     * - returned object should contain config for other chains
     */
    it('should remove chain with config successfully', () => {
      const targetChain = 'targetChain';
      const otherChain = 'otherChain';
      const otherChainHeight = 5000;
      const otherChainFee = {
        bridgeFee: 200n,
        networkFee: 201n,
        rsnRatio: 202n,
        rsnRatioDivisor: 203n,
        feeRatio: 204n,
      };
      const minimumFeeConfig = new MinimumFeeConfig()
        .addChainConfig(targetChain, 5000, {
          bridgeFee: 100n,
          networkFee: 101n,
          rsnRatio: 102n,
          rsnRatioDivisor: 103n,
          feeRatio: 104n,
        })
        .addChainConfig(otherChain, otherChainHeight, otherChainFee);

      const result = minimumFeeConfig.removeChainConfig(targetChain);

      expect(result.getConfig().heights[targetChain]).toBeUndefined();
      expect(result.getConfig().configs[targetChain]).toBeUndefined();
      expect(result.getConfig().heights[otherChain]).toEqual(otherChainHeight);
      expect(result.getConfig().configs[otherChain]).toEqual(otherChainFee);
    });

    /**
     * @target MinimumFeeConfig.removeChainConfig should remove chain WITHOUT config successfully
     * @dependencies
     * @scenario
     * - mock test data (add config for two chain)
     * - run test
     * - check returned value
     * @expected
     * - returned object should NOT contain height of target chain
     * - returned object should contain config for other chains
     */
    it('should remove chain WITHOUT config successfully', () => {
      const targetChain = 'targetChain';
      const otherChain = 'otherChain';
      const otherChainHeight = 5000;
      const otherChainFee = {
        bridgeFee: 200n,
        networkFee: 201n,
        rsnRatio: 202n,
        rsnRatioDivisor: 203n,
        feeRatio: 204n,
      };
      const minimumFeeConfig = new MinimumFeeConfig()
        .addChainConfig(targetChain, 5000, undefined)
        .addChainConfig(otherChain, otherChainHeight, otherChainFee);

      const result = minimumFeeConfig.removeChainConfig(targetChain);

      expect(result.getConfig().heights[targetChain]).toBeUndefined();
      expect(result.getConfig().configs[targetChain]).toBeUndefined();
      expect(result.getConfig().heights[otherChain]).toEqual(otherChainHeight);
      expect(result.getConfig().configs[otherChain]).toEqual(otherChainFee);
    });
  });
});
