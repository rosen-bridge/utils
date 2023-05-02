import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { CardanoAssetHealthCheckParam } from '../../../../lib/params/assetHealthCheck/CardanoAssetHealthCheck';

/**
 * mocks koios api token amount
 * @param amount token amount
 */
const mockKoiosAssetQuantity = (amount: bigint) => {
  jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
    address: {
      postAddressAssets: async () => [
        {
          asset_list: [
            {
              fingerprint: 'assetId',
              quantity: amount.toString(),
            },
          ],
        },
      ],
    },
  } as any);
};

class TestCardanoAssetHealthCheck extends CardanoAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

export { mockKoiosAssetQuantity, TestCardanoAssetHealthCheck };
