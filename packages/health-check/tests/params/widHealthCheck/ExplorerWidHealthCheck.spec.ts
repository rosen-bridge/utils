import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { TestExplorerWidHealthCheck } from './TestExplorerWidHealthCheck';

jest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerWidAssetHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @target ExplorerWidAssetHealthCheckParam.update Should update the wid status to exists, using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer watcher address assets
     * - mock return value of explorer address boxes
     * - create new instance of ErgoExplorerWidHealthCheck
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using explorer api
     */
    it('Should update the wid status to exists, using explorer', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: async () => {
            return {
              nanoErgs: 2899100000,
              tokens: [
                {
                  tokenId:
                    '10278c102bf890fdab8ef5111e94053c90b3541bc25b0de2ee8aa6305ccec3de',
                  amount: 81072,
                },
                {
                  tokenId:
                    'e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c',
                  amount: 1,
                },
              ],
            };
          },
          // mock return value of explorer address
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [
                {
                  assets: [
                    {
                      tokenId: 'rwtRepoNft',
                      amount: 1n,
                    },
                  ],
                  additionalRegisters: {
                    R4: {
                      serializedValue:
                        '1a0b046572676f20c1f5aa4b1a713396a63f556df49c70add93b3471cbca893c6146fce5a4b95e7620d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a75220ed6b8b63d187198f3ba55468231b5c83c050f7273364211fcf3b1ca7526ff30220846f72637b75f4817eb3f6e8542cb2d92875cf1ddce0fd5b734fc7c9bb48ac6020101f5f0995d90c80a9491815571ed1c9fc5522922fa3bbccbd575d1aa7255f9020e09921d0a87bb63e94aa6074c090a903a280ebd8cfba862396e56668f7138fe120730488119f223822c77c9c89fa73e1794116dd1503fcabf3fc9217ffe7b7b50820da06f26f55cca0ad06880e0e8fe40d4011373e526f6aafe47caba8f5fa16970720d206d6f37bc63fae26fbb591d5d4b60181db35fb712ae6dfa2c5faf0078d66eb20e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c',
                    },
                  },
                },
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 12n,
                    },
                  ],
                },
              ],
              total: 2,
            };
          },
        },
      } as any);

      // create new instance of ErgoExplorerWidHealthCheck
      const assetHealthCheckParam = new TestExplorerWidHealthCheck(
        'rwtRepoAddress',
        'rwtRepoNft',
        'address',
        'explorer_url'
      );

      // update the parameter
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getWidStatus()).toBe(true);
    });

    /**
     * @target ExplorerWidAssetHealthCheckParam.update Should update the wid status to not exists, using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer watcher address assets
     * - mock return value of explorer address
     * - create new instance of ErgoExplorerWidHealthCheck
     * - update the parameter
     * @expected
     * - The widExists should update to false successfully using explorer api
     */
    it('Should update the wid status to not exists, using explorer', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: async () => {
            return {
              nanoErgs: 2899100000,
              tokens: [
                {
                  tokenId:
                    '10278c102bf890fdab8ef5111e94053c90b3541bc25b0de2ee8aa6305ccec3de',
                  amount: 81072,
                },
              ],
            };
          },
          // mock return value of explorer address
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [
                {
                  assets: [
                    {
                      tokenId:
                        '3ac8a90d0aa8c5c50e99dd2588a990fd37b5d3aee70e32d56241f41ed49e9f03',
                      amount: 1n,
                    },
                  ],
                  additionalRegisters: {
                    R4: {
                      serializedValue:
                        '1a0b046572676f20c1f5aa4b1a713396a63f556df49c70add93b3471cbca893c6146fce5a4b95e7620d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a75220ed6b8b63d187198f3ba55468231b5c83c050f7273364211fcf3b1ca7526ff30220846f72637b75f4817eb3f6e8542cb2d92875cf1ddce0fd5b734fc7c9bb48ac6020101f5f0995d90c80a9491815571ed1c9fc5522922fa3bbccbd575d1aa7255f9020e09921d0a87bb63e94aa6074c090a903a280ebd8cfba862396e56668f7138fe120730488119f223822c77c9c89fa73e1794116dd1503fcabf3fc9217ffe7b7b50820da06f26f55cca0ad06880e0e8fe40d4011373e526f6aafe47caba8f5fa16970720d206d6f37bc63fae26fbb591d5d4b60181db35fb712ae6dfa2c5faf0078d66eb20e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c',
                    },
                  },
                },
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 12n,
                    },
                  ],
                },
              ],
              total: 2,
            };
          },
        },
      } as any);

      // create new instance of ErgoExplorerWidHealthCheck
      const assetHealthCheckParam = new TestExplorerWidHealthCheck(
        'rwtRepoAddress',
        '3ac8a90d0aa8c5c50e99dd2588a990fd37b5d3aee70e32d56241f41ed49e9f03',
        'address',
        'explorer_url'
      );

      // update the parameter
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getWidStatus()).toBe(false);
    });
  });
});
