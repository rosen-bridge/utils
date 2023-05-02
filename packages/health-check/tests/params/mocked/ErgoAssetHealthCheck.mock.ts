import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

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

const mockExplorerTokenAmount = (amount: bigint) => {
  jest.mocked(ergoExplorerClientFactory).mockReturnValue({
    v1: {
      getApiV1AddressesP1BalanceConfirmed: async () => ({
        tokens: [{ tokenId: 'assetId', amount: amount }],
      }),
    },
  } as any);
};

export { mockNodeTokenAmount, mockExplorerTokenAmount };
