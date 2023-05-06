import {
  TestErgoExplorerAssetHealthCheck,
  TestErgoNodeAssetHealthCheck,
} from './TestErgoAssetHealthCheck';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ERGO_NATIVE_ASSET } from '../../../lib/constants';

jest.mock('@rosen-clients/ergo-node');
jest.mock('@rosen-clients/ergo-explorer');

describe('ErgoExplorerAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * Mock return value of explorer address total balance
     */
    beforeEach(() => {
      jest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1AddressesP1BalanceConfirmed: async () => ({
            tokens: [{ tokenId: 'assetId', amount: 1200n }],
            nanoErgs: 120000n,
          }),
        },
      } as any);
    });

    /**
     * @target ErgoExplorerAssetHealthCheck.update Should update the token amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount update successfully using explorer api
     */
    it('Should update the token amount using explorer', async () => {
      const assetHealthCheckParam = new TestErgoExplorerAssetHealthCheck(
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

    /**
     * @target ErgoExplorerAssetHealthCheck.update Should update the erg amount using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The erg amount should update successfully using explorer api
     */
    it('Should update the erg amount using explorer', async () => {
      const assetHealthCheckParam = new TestErgoExplorerAssetHealthCheck(
        ERGO_NATIVE_ASSET,
        ERGO_NATIVE_ASSET,
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

describe('ErgoNodeAssetHealthCheck', () => {
  describe('update', () => {
    /**
     * Mock return value of node address total balance
     */
    beforeEach(() => {
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        blockchain: {
          getAddressBalanceTotal: async () => ({
            confirmed: {
              tokens: [{ tokenId: 'assetId', amount: 1200n }],
              nanoErgs: 120000n,
            },
          }),
        },
      } as any);
    });

    /**
     * @target ErgoNodeAssetHealthCheck.update Should update the token amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The token amount should update successfully using node api
     */
    it('Should update the token amount using node', async () => {
      const assetHealthCheckParam = new TestErgoNodeAssetHealthCheck(
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

    /**
     * @target ErgoNodeAssetHealthCheck.update Should update the erg amount using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The erg amount should update successfully using node api
     */
    it('Should update the erg amount using node', async () => {
      const assetHealthCheckParam = new TestErgoNodeAssetHealthCheck(
        ERGO_NATIVE_ASSET,
        ERGO_NATIVE_ASSET,
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
