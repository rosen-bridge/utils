import { gql } from '@apollo/client/core';

export type AddressAssetsQuery = {
  __typename?: 'Query';
  paymentAddresses?: Array<{
    __typename?: 'PaymentAddress';
    summary?: {
      __typename?: 'PaymentAddressSummary';
      assetBalances: Array<{
        __typename?: 'AssetBalance';
        quantity: string;
        asset: { __typename?: 'Asset'; assetName?: any | null; policyId: any };
      } | null>;
    } | null;
  } | null> | null;
};

export const addressAssetsQuery = gql(`
query addressAssets($addresses: [String]!) {
  paymentAddresses(addresses: $addresses) {
    summary {
      assetBalances {
        asset {
          assetName
          policyId
        }
        quantity
      }
    }
  }
}
`);

export const addressQueryVariables = (address: string) => ({
  addresses: [address],
});
