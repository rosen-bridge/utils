import { TestExplorerPermitHealthCheck } from './TestExplorerPermitHealthCheck';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

jest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerPermitAssetHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @target ExplorerPermitAssetHealthCheckParam.update Should update the permit count using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer permit address boxes
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The permit count should update successfully using explorer api
     */
    it('Should update the permit count using explorer', async () => {
      // mock return value of explorer permit address boxes
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 10n,
                    },
                  ],
                  additionalRegisters: {
                    R4: {
                      serializedValue:
                        '1a0120d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
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
                  additionalRegisters: {
                    R4: {
                      serializedValue:
                        '1a0120d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
                    },
                  },
                },
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 10n,
                    },
                  ],
                  additionalRegisters: {
                    R4: {
                      serializedValue:
                        '1a0120c1f5aa4b1a713396a63f556df49c70add93b3471cbca893c6146fce5a4b95e76',
                    },
                  },
                },
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 10n,
                    },
                  ],
                  additionalRegisters: {},
                },
              ],
              total: 3,
            };
          },
        },
      } as any);

      // create new instance of ErgoExplorerAssetHealthCheck
      const assetHealthCheckParam = new TestExplorerPermitHealthCheck(
        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
        'permitAddress',
        'd4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
        100n,
        10n,
        'url'
      );

      // update the parameter
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getRWTCount()).toBe(22n);
    });
  });
});
