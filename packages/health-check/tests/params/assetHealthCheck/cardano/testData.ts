export const addressAssetsResult = {
  data: {
    paymentAddresses: [
      {
        __typename: 'PaymentAddress',
        summary: {
          __typename: 'PaymentAddressSummary',
          assetBalances: [
            {
              __typename: 'AssetBalance',
              asset: { __typename: 'Asset', assetName: 'ada', policyId: 'ada' },
              quantity: '120000',
            },
            {
              __typename: 'AssetBalance',
              asset: {
                __typename: 'Asset',
                assetName: 'asset_name',
                policyId: 'policy_id',
              },
              quantity: '1200',
            },
          ],
        },
      },
    ],
  },
  loading: false,
  networkStatus: 7,
};
