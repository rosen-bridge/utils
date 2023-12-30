import { AbstractScannerSyncHealthCheckParam } from '../AbstractScannerSyncHealthCheck';
import { DataSource } from 'typeorm';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { CurrentHeightQuery, currentHeightQuery } from './graphQLTypes';
import fetch from 'cross-fetch';

export class CardanoGraphQLScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
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
      link: new HttpLink({ uri: graphqlUri, fetch }),
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
