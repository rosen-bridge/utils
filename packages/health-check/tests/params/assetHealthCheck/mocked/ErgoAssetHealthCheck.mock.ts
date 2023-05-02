import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  ErgoExplorerAssetHealthCheckParam,
  ErgoNodeAssetHealthCheckParam,
} from '../../../../lib';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

/**
 * mocks explorer api token amount
 * @param amount token amount
 */
const mockExplorerTokenAmount = (amount: bigint) => {
  jest.mocked(ergoExplorerClientFactory).mockReturnValue({
    v1: {
      getApiV1AddressesP1BalanceConfirmed: async () => ({
        tokens: [{ tokenId: 'assetId', amount: amount }],
      }),
    },
  } as any);
};

/**
 * mocks node api token amount
 * @param amount token amount
 */
const mockNodeTokenAmount = (amount: bigint) => {
  jest.mocked(ergoNodeClientFactory).mockReturnValue({
    blockchain: {
      getAddressBalanceTotal: async () => ({
        confirmed: {
          tokens: [{ tokenId: 'assetId', amount: amount }],
        },
      }),
    },
  } as any);
};

class TestErgoExplorerAssetHealthCheck extends ErgoExplorerAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

class TestErgoNodeAssetHealthCheck extends ErgoNodeAssetHealthCheckParam {
  /**
   * @returns protected token amount
   */
  getTokenAmount = () => {
    return this.tokenAmount;
  };
}

export {
  mockExplorerTokenAmount,
  mockNodeTokenAmount,
  TestErgoNodeAssetHealthCheck,
  TestErgoExplorerAssetHealthCheck,
};
