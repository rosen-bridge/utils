import { CARDANO_NATIVE_ASSET, MAINNET } from '../../constants';
import { AbstractAssetHealthCheckParam } from './AbstractAssetHealthCheck';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  AddressAssetsQuery,
  addressAssetsQuery,
  addressQueryVariables,
} from './graphQLTypes';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

class CardanoKoiosAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private koiosApi;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    koiosUrl: string,
    assetDecimal = 0,
    authToken?: string
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.koiosApi = cardanoKoiosClientFactory(koiosUrl, authToken);
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const infos = await this.koiosApi.postAddressInfo({
        _addresses: [this.address],
      });
      if (infos[0].balance) tokenAmount = BigInt(infos[0].balance);
    } else {
      const assets = await this.koiosApi.postAddressAssets({
        _addresses: [this.address],
      });
      const token = assets.find(
        (token) => `${token.policy_id}.${token.asset_name}` == this.assetId
      );
      if (token && token.quantity) tokenAmount = BigInt(token.quantity);
    }

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

class CardanoBlockFrostAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  private blockFrost;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    projectId: string,
    assetDecimal = 0,
    blockFrostUrl?: string
  ) {
    super(
      assetId,
      assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal
    );
    this.blockFrost = new BlockFrostAPI({
      projectId: projectId,
      customBackend: blockFrostUrl,
      network: MAINNET,
    });
  }

  /**
   * Updates the asset health status and the update timestamp
   */
  update = async () => {
    let tokenAmount = 0n;
    const assets = await this.blockFrost.addresses(this.address);
    if (this.assetId == CARDANO_NATIVE_ASSET) {
      const nativeToken = assets.amount.find(
        (asset) => asset.unit === 'lovelace'
      );
      if (nativeToken) tokenAmount = BigInt(nativeToken.quantity);
    } else {
      const unit = this.assetId.split('.').join('');
      const token = assets.amount.find((asset) => asset.unit === unit);
      if (token) tokenAmount = BigInt(token.quantity);
    }

    this.tokenAmount = tokenAmount;
    this.updateTimeStamp = new Date();
  };
}

class CardanoGraphQLAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
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
      uri: graphqlUri,
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

export {
  CardanoKoiosAssetHealthCheckParam,
  CardanoBlockFrostAssetHealthCheckParam,
  CardanoGraphQLAssetHealthCheckParam,
};
