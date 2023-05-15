import { TestNodePermitHealthCheck } from './TestNodePermitHealthCheck';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

jest.mock('@rosen-clients/ergo-node');

describe('NodePermitAssetHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @target NodePermitAssetHealthCheckParam.update Should update the permit count using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node permit address boxes
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The permit count should update successfully using node api
     */
    it('Should update the permit count using node', async () => {
      // mock the return value of node permit address boxes
      let firstOut = true;
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        blockchain: {
          getBoxesByAddressUnspent: async () => {
            if (firstOut) {
              firstOut = false;
              return [
                {
                  assets: [
                    {
                      tokenId:
                        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
                      amount: 10n,
                    },
                  ],
                  additionalRegisters: {
                    R4: '1a0120d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
                    R5: '0e0100',
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
                    R4: '1a0120d4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
                    R5: '0e0100',
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
                    R4: '1a0120c1f5aa4b1a713396a63f556df49c70add93b3471cbca893c6146fce5a4b95e76',
                    R5: '0e0100',
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
              ];
            } else return [];
          },
        },
      } as any);

      // create new instance of ErgoNodeAssetHealthCheck
      const assetHealthCheckParam = new TestNodePermitHealthCheck(
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
