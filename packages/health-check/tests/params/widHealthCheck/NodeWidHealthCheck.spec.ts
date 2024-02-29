import { TestNodeWidHealthCheck } from './TestNodeWidHealthCheck';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import * as wasm from 'ergo-lib-wasm-nodejs';

jest.mock('@rosen-clients/ergo-node');

describe('NodeWidHealthCheckParam', () => {
  describe('update', () => {
    const wid =
      'e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c';
    /**
     * @returns a mocked balance api function including a wid
     */
    const mockedBalanceWithWid = (wid: string) => {
      const mockedBalanaceFunc = jest.fn();
      mockedBalanaceFunc.mockReturnValue({
        confirmed: {
          tokens: [
            {
              tokenId:
                '10278c102bf890fdab8ef5111e94053c90b3541bc25b0de2ee8aa6305ccec3de',
              amount: 1200n,
            },
            {
              tokenId: wid,
              amount: 1n,
            },
          ],
        },
      });
      return mockedBalanaceFunc;
    };

    /**
     * @param awcNft
     * @returns a mocked repo box with correct nft and registrt value
     */
    const mockedCollateralBox = (awcNft: string, wid: string) => {
      return {
        assets: [
          {
            tokenId: awcNft,
            amount: 1n,
          },
        ],
        additionalRegisters: {
          R4: Buffer.from(
            wasm.Constant.from_byte_array(
              Buffer.from(wid, 'hex')
            ).sigma_serialize_bytes()
          ).toString('hex'),
        },
      };
    };

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using node api
     */
    it('Should update the wid status to exists', async () => {
      const BoxesApiMock = jest.fn();
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid(wid),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as any);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([
        mockedCollateralBox('awcNft', wid),
        mockedCollateralBox('fakeAwc', wid),
      ]).mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(true);
    });

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to not exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to false successfully using node api
     */
    it('Should update the wid status to not exists', async () => {
      const BoxesApiMock = jest.fn();
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid('no-wid'),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as any);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([
        mockedCollateralBox(
          'awcNft',
          '74f3775de5fe5002c197311ebb80eaa4346646f24d8381b1bf271c11fd2ee095'
        ),
        mockedCollateralBox('fakeAwc', wid),
      ]).mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(false);
    });

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to exists with multiple responses
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using node api
     */
    it('Should update the wid status to exists with multiple responses', async () => {
      const BoxesApiMock = jest.fn();
      jest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid(wid),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as any);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([mockedCollateralBox('fakeAwc', wid)])
        .mockReturnValueOnce([mockedCollateralBox('awcNft', wid)])
        .mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url'
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(true);
    });
  });
});
