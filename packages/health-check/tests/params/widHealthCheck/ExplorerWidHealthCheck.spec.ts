import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { TestExplorerWidHealthCheck } from './TestExplorerWidHealthCheck';

jest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerWidHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @returns a mocked balance api function including a wid
     */
    const mockedBalanceWithWid = () => {
      const mockedBalanaceFunc = jest.fn();
      mockedBalanaceFunc.mockReturnValue({
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
      });
      return mockedBalanaceFunc;
    };

    /**
     * @param repoNft
     * @returns a mocked repo box with correct nft and registrt value
     */
    const mockedRepoBox = (repoNft: string) => {
      return {
        assets: [
          {
            tokenId: repoNft,
            amount: 1n,
          },
        ],
        additionalRegisters: {
          R4: {
            serializedValue:
              '1a0b046572676f20c1f5aa4b1a713396a63f556df49c70add93b3471cbca893c6146fce5a4b95e7620d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a75220ed6b8b63d187198f3ba55468231b5c83c050f7273364211fcf3b1ca7526ff30220846f72637b75f4817eb3f6e8542cb2d92875cf1ddce0fd5b734fc7c9bb48ac6020101f5f0995d90c80a9491815571ed1c9fc5522922fa3bbccbd575d1aa7255f9020e09921d0a87bb63e94aa6074c090a903a280ebd8cfba862396e56668f7138fe120730488119f223822c77c9c89fa73e1794116dd1503fcabf3fc9217ffe7b7b50820da06f26f55cca0ad06880e0e8fe40d4011373e526f6aafe47caba8f5fa16970720d206d6f37bc63fae26fbb591d5d4b60181db35fb712ae6dfa2c5faf0078d66eb20e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c',
          },
        },
      };
    };

    /**
     * @returns a fake repobox with incorrect token id
     */
    const mockedFakeRepoBox = () => {
      return {
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
      };
    };

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to exists
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
    it('Should update the wid status to exists', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: mockedBalanceWithWid(),
          // mock return value of explorer address
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [mockedRepoBox('rwtRepoNft'), mockedFakeRepoBox()],
              total: 2,
            };
          },
        },
      } as any);

      // create new instance of ErgoExplorerWidHealthCheck
      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'rwtRepoAddress',
        'rwtRepoNft',
        'address',
        'explorer_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(true);
    });

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to not exists
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
    it('Should update the wid status to not exists', async () => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: async () => {
            return {
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
              items: [mockedRepoBox('rwtRepoNft')],
              total: 1,
            };
          },
        },
      } as any);

      // create new instance of ErgoExplorerWidHealthCheck
      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'rwtRepoAddress',
        'rwtRepoNft',
        'address',
        'explorer_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(false);
    });

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to exists with multiple responses
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
    it('Should update the wid status to exists with multiple responses', async () => {
      const boxesApiMock = jest.fn();
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: mockedBalanceWithWid(),
          getApiV1BoxesUnspentByaddressP1: boxesApiMock,
        },
      } as any);

      // mock return value of explorer address
      boxesApiMock
        .mockReturnValueOnce({
          items: [mockedFakeRepoBox()],
          total: 103,
        })
        .mockReturnValueOnce({
          items: [mockedRepoBox('rwtRepoNft')],
          total: 103,
        });

      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'rwtRepoAddress',
        'rwtRepoNft',
        'address',
        'explorer_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(true);
    });
  });
});
