import { CARDANO_NATIVE_ASSET } from '../../../constants';
import { AbstractAssetHealthCheckParam } from '../AbstractAssetHealthCheck';
import {
  AddressAssetsQuery,
  addressAssetsQuery,
  addressQueryVariables,
} from './graphQLTypes';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import fetch from 'cross-fetch';

export class CardanoGraphQLAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    graphqlUri: string,
    assetDecimal = 0
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: graphqlUri, fetch }),
    });
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    const res = await this.client.query<AddressAssetsQuery>({
      query: addressAssetsQuery,
      variables: addressQueryVariables(this.address),
    });

    const addresses = res.data.paymentAddresses;
    if (addresses && addresses[0]?.summary?.assetBalances) {
      const assets = addresses[0].summary.assetBalances;
      if (this.assetId == CARDANO_NATIVE_ASSET) {
        // get ADA value
        const adaAmount = assets.find(
          (balance) => balance?.asset.policyId === 'ada'
        )?.quantity;
        if (adaAmount) tokenAmount = BigInt(adaAmount);
      } else {
        // get tokens value
        const assetUnit = this.assetId.split('.');
        const amount = assets.find(
          (balance) =>
            balance?.asset.policyId === assetUnit[0] &&
            balance?.asset.assetName === assetUnit[1]
        )?.quantity;
        if (amount) tokenAmount = BigInt(amount);
      }
    }

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}
