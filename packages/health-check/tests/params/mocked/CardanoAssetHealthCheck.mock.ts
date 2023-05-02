import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

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

export { mockKoiosAssetQuantity };
