import { CARDANO_NATIVE_ASSET } from '../../../lib/constants';
import { TestCardanoAssetHealthCheck } from './TestCardanoAssetHealthCheck';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

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
      jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        postAddressAssets: async () => [
          {
            asset_list: [
              {
                fingerprint: 'assetId',
                quantity: '1200',
              },
            ],
          },
        ],
      } as any);
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

  /**
   * @target CardanoAssetHealthCheck.update Should update the ada amount using koios api
   * @dependencies
   * - cardanoKoiosClientFactory
   * @scenario
   * - mock return value of koios ada balance
   * - create new instance of CardanoAssetHealthCheck
   * - update the parameter
   * @expected
   * - The native cardano asset amount should update successfully using koios api
   */
  it('Should update the ada amount using koios api', async () => {
    jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
      postAddressInfo: async () => [
        {
          balance: 120000n,
        },
      ],
    } as any);
    const assetHealthCheckParam = new TestCardanoAssetHealthCheck(
      CARDANO_NATIVE_ASSET,
      CARDANO_NATIVE_ASSET,
      'address',
      100n,
      10n,
      'url'
    );
    await assetHealthCheckParam.update();

    expect(assetHealthCheckParam.getTokenAmount()).toBe(120000n);
  });
});
