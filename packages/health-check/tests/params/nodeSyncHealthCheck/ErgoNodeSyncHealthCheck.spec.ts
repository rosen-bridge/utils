import { HealthStatusLevel } from '../../../lib';
import { TestErgoNodeSyncHealthCheckParam } from './TestErgoNodeSyncHealthCheck';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

jest.useFakeTimers();
jest.mock('@rosen-clients/ergo-node');

describe('ErgoNodeSyncHealthCheckParam', () => {
  describe('getHealthStatus', () => {
    /**
     * Creating a new instance of ErgoNodeSyncHealthCheckParam for all tests
     */
    let nodeSyncHealthCheckParam: TestErgoNodeSyncHealthCheckParam;
    beforeAll(() => {
      nodeSyncHealthCheckParam = new TestErgoNodeSyncHealthCheckParam(
        100,
        10,
        20,
        50,
        'url'
      );
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus should return HEALTHY when all conditions are false
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when all conditions are false', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(90);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(5);
      nodeSyncHealthCheckParam.setNodePeerCount(21);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus Should return UNSTABLE when at least one conditions is true
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when at least one conditions is true', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(90);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(5);
      nodeSyncHealthCheckParam.setNodePeerCount(10);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus Should return the should return BROKEN when at least three conditions is true
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when token amount is less than critical threshold', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(900);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(12);
      nodeSyncHealthCheckParam.setNodePeerCount(10);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });

  describe('update', () => {
    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus Should update all parameters correctly
     * @dependencies
     * @scenario
     * - mock node info api
     * - mock node last block headers api
     * - mock node connected peers api
     * - mock node peers sync info api
     * - get health status
     * @expected
     * - Should update the height difference, last block time, peer count and peer height difference
     */
    it('should update all parameters correctly', async () => {
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        info: {
          getNodeInfo: async () => ({
            headersHeight: 12345n,
            fullHeight: 12300n,
          }),
        },
        blocks: {
          getLastHeaders: async () => [
            {
              timestamp: 1687161388456,
            },
          ],
        },
        peers: {
          getConnectedPeers: async () => [
            {
              address: '127.0.0.1:5678',
            },
            {
              address: '127.0.0.1:5679',
            },
          ],
          getPeersSyncInfo: async () => [
            {
              height: 12350,
            },
            {
              height: 12355,
            },
          ],
        },
      } as any);
      jest.setSystemTime(1687167388456);

      const nodeSyncHealthCheck = new TestErgoNodeSyncHealthCheckParam(
        100,
        10,
        20,
        50,
        'url'
      );
      await nodeSyncHealthCheck.update();
      expect(nodeSyncHealthCheck.getHeightDifference()).toBe(45);
      expect(nodeSyncHealthCheck.getLastBlockTime()).toBe(100);
      expect(nodeSyncHealthCheck.getPeerCount()).toBe(2);
      expect(nodeSyncHealthCheck.getPeerDifference()).toBe(55);
    });
  });
});
