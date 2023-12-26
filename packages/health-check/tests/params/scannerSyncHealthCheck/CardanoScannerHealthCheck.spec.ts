import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { createDataSource } from './Utils';
import {
  CardanoKoiosScannerHealthCheck,
  CardanoOgmiosScannerHealthCheck,
} from '../../../lib';
import { createLedgerStateQueryClient } from '@cardano-ogmios/client';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import {
  TestCardanoBlockFrostScannerHealthCheck,
  TestCardanoGraphQLScannerHealthCheck,
} from './TestScannerHealthChecks';

jest.mock('@cardano-ogmios/client');
jest.mock('@rosen-clients/cardano-koios');

describe('CardanoScannerHealthCheck', () => {
  describe('CardanoKoiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoKoiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios last block info
     * - create new instance of CardanoKoiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        getTip: async () => [
          {
            block_no: 1115,
          },
        ],
      } as any);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoKoiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });

  describe('CardanoOgmiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoOgmiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of ogmios api
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      jest.mocked(createLedgerStateQueryClient).mockImplementation(async () => {
        return {
          networkBlockHeight: async () => 1115,
        } as any;
      });

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url',
        123
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });

  describe('CardanoBlockFrostScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoBlockFrostScannerHealthCheck.update should return the last available block in network
     * @dependencies
     * - cardanoBlockFrostClientFactory
     * @scenario
     * - mock return value of blockfrost last block info
     * - create new instance of CardanoBlockFrostScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('should return the last available block in network', async () => {
      const dataSource = await createDataSource();
      const scannerHealthCheckParam =
        new TestCardanoBlockFrostScannerHealthCheck(
          dataSource,
          'scannerName',
          100,
          10,
          'url'
        );
      jest
        .spyOn(scannerHealthCheckParam.getClient(), 'blocksLatest')
        .mockResolvedValue({ height: 1115 } as any);
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });

  describe('CardanoGraphQLScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoGraphQLScannerHealthCheck.update should return the last available block in network
     * @dependencies
     * - cardanoGraphQLClientFactory
     * @scenario
     * - mock return value of graphql last block info
     * - create new instance of CardanoGraphQLScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('should return the last available block in network', async () => {
      const mockedCurrentHeightResult = {
        data: {
          cardano: {
            __typename: 'Cardano',
            tip: { __typename: 'Block', number: 1115, slotNo: '1114' },
          },
        },
        loading: false,
        networkStatus: 7,
      };

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new TestCardanoGraphQLScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url'
      );
      jest
        .spyOn(scannerHealthCheckParam.getClient(), 'query')
        .mockResolvedValue(mockedCurrentHeightResult);
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
