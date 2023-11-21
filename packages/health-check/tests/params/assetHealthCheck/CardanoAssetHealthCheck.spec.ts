import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { CARDANO_NATIVE_ASSET } from '../../../lib/constants';
import {
  TestCardanoAssetHealthCheck,
  TestCardanoBlockFrostAssetHealthCheck,
} from './TestCardanoAssetHealthCheck';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

jest.mock('@rosen-clients/cardano-koios');
jest.mock('@blockfrost/blockfrost-js');

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
            address: 'address',
            policy_id: 'policy_id',
            asset_name: 'asset_name',
            quantity: '1200',
          },
        ],
      } as any);
      const assetHealthCheckParam = new TestCardanoAssetHealthCheck(
        'policy_id.asset_name',
        'assetName',
        'address',
        100n,
        10n,
        'url'
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1200n);
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
});

describe('CardanoBlockFrostAssetHealthCheckParam', () => {
  describe('update', () => {
    beforeEach(() => {
      jest.mocked(BlockFrostAPI).mockReturnValue({
        addresses: async () => ({
          address: 'address',
          amount: [
            {
              unit: 'lovelace',
              quantity: '99000000',
            },
            {
              unit: '0dad352d8f0d5ce3f5be8b025d6a16141ecceab5a921871792d91f475273455247',
              quantity: '15888202094',
            },
            {
              unit: '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b952535457',
              quantity: '1866325',
            },
          ],
          stake_address: null,
          type: 'shelley',
          script: false,
        }),
      } as any);
    });

    /**
     * @target CardanoBlockFrostAssetHealthCheckParam.update should update the token amount using blockfrost api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of blockfrost address info
     * - create new instance of CardanoBlockFrostAssetHealthCheckParam
     * - update the parameter
     * @expected
     * - The token amount should update successfully using blockfrost api
     */
    it('should update the token amount using blockfrost api', async () => {
      const assetHealthCheckParam = new TestCardanoBlockFrostAssetHealthCheck(
        '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457',
        'assetName',
        'address',
        100n,
        10n,
        ''
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(1866325n);
    });

    /**
     * @target CardanoBlockFrostAssetHealthCheckParam.update should update the ada amount using blockfrost api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of blockfrost address info
     * - create new instance of CardanoBlockFrostAssetHealthCheckParam
     * - update the parameter
     * @expected
     * - The native cardano asset amount should update successfully using blockfrost api
     */
    it('should update the ada amount using blockfrost api', async () => {
      const assetHealthCheckParam = new TestCardanoBlockFrostAssetHealthCheck(
        CARDANO_NATIVE_ASSET,
        CARDANO_NATIVE_ASSET,
        'address',
        100n,
        10n,
        ''
      );
      await assetHealthCheckParam.update();

      expect(assetHealthCheckParam.getTokenAmount()).toBe(99000000n);
    });
  });
});
