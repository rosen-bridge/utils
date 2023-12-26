import { AbstractScannerSyncHealthCheckParam } from './AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import {
  createInteractionContext,
  InteractionContext,
  createLedgerStateQueryClient,
} from '@cardano-ogmios/client';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { CurrentHeightQuery, currentHeightQuery } from './graphQLTypes';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

class CardanoKoiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private koiosApi;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    networkUrl: string,
    authToken?: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.koiosApi = cardanoKoiosClientFactory(networkUrl, authToken);
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (Koios)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    return Number((await this.koiosApi.getTip())[0].block_no);
  };
}

class CardanoOgmiosScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  private ogmiosPort: number;
  private ogmiosHost: string;
  private useTls: boolean;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    ogmiosHost: string,
    ogmiosPort: number,
    useTls = false
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.ogmiosHost = ogmiosHost;
    this.ogmiosPort = ogmiosPort;
    this.useTls = useTls;
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (Ogmios)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = async () => {
    const context: InteractionContext = await createInteractionContext(
      (err) => console.error(err),
      () => undefined,
      {
        connection: {
          port: this.ogmiosPort,
          host: this.ogmiosHost,
          tls: this.useTls,
        },
      }
    );
    const ogmiosClient = await createLedgerStateQueryClient(context);
    const height = await ogmiosClient.networkBlockHeight();
    if (height == 'origin') return 0;
    else return height;
  };
}

class CardanoBlockFrostScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    projectId: string,
    url?: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.client = new BlockFrostAPI({
      projectId: projectId,
      customBackend: url,
      network: 'mainnet',
    });
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (BlockFrost)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client.blocksLatest().then((block) => {
      const height = block.height;
      return height ?? 0;
    });
  };
}

class CardanoGraphQLScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    dataSource: DataSource,
    scannerName: string,
    warnDifference: number,
    criticalDifference: number,
    graphqlUri: string
  ) {
    super(dataSource, scannerName, warnDifference, criticalDifference);
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      uri: graphqlUri,
    });
  }

  /**
   * generates a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `Cardano Scanner Sync (GraphQL)`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client
      .query<CurrentHeightQuery>({
        query: currentHeightQuery,
      })
      .then((res) => {
        const height = res.data.cardano.tip.number;
        return height ?? 0;
      });
  };
}

export {
  CardanoKoiosScannerHealthCheck,
  CardanoOgmiosScannerHealthCheck,
  CardanoBlockFrostScannerHealthCheck,
  CardanoGraphQLScannerHealthCheck,
};
