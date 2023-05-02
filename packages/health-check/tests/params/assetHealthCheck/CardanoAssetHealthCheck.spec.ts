import {
  TestCardanoAssetHealthCheck,
  mockKoiosAssetQuantity,
} from './mocked/CardanoAssetHealthCheck.mock';

jest.mock('@rosen-clients/cardano-koios');

describe('CardanoAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * @target CardanoAssetHealthCheck.update Should update the token amount using koios api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios token amount
     * - create new instance of CardanoAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using koios api
     */
    it('Should update the token amount using koios api', async () => {
      mockKoiosAssetQuantity(1200n);
      const assetHealthCheckParam = new TestCardanoAssetHealthCheck(
        'assetId',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
    });
  });
});
