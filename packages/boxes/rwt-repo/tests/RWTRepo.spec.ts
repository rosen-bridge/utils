import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { RWTRepo } from '../lib';
import { jsonBigInt } from '../lib/Utils';
import { rwtRepoInfoSample } from './RWTRepoTestData';
import {
  mockedErgoExplorerClientFactory,
  mockedErgoNodeClientFactory,
} from './RWTRepo.mock';

describe('RWTRepo', () => {
  describe('updateBox', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    /**
     * @target updateBox of RWTRepo created with
     * networkType=ErgoNetworkType.Explorer argument, should update the box
     * member variable with ErgoBox created from the unspent box info received
     * from explorer api for the corresponding repoAddress and repoNft set on
     * this instance
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Explorer
     * and specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromExplorer private method has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromExplorer private method should have been called
     */
    it(`updateBox of RWTRepo created with networkType=ErgoNetworkType.Explorer
    argument, should update the box member variable with ErgoBox created from
    the unspent box info received from explorer api for the corresponding
    repoAddress and repoNft set on this instance`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      const spyGetBoxFromExplorer = jest.spyOn(
        rwtRepo as any,
        'getBoxFromExplorer'
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromExplorer).toHaveBeenCalled();
    });

    /**
     * @target updateBox of RWTRepo created with
     * networkType=ErgoNetworkType.Explorer argument, should not update the box
     * member variable if it has a value and it's still unspent
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Explorer
     * and specific repoAddress and repoNft
     * - assign an ErgoBox to RWTRepo.box
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to check if it should update the box
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromExplorer private method has been called
     * - check if RWTRepo.box is not changed and not replaced with a new
     * instance
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromExplorer private method should have been called
     * - RWTRepo.box should not be changed and not replaced with a new instance
     */
    it(`updateBox of RWTRepo created with networkType=ErgoNetworkType.Explorer
    argument, should not update the box member variable if it has a value and
    it's still unspent`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      const currentBox = ErgoBox.from_json(
        jsonBigInt.stringify(rwtRepoInfoSample.BoxInfo)
      );
      rwtRepo['box'] = currentBox;

      const spyGetBoxFromExplorer = jest.spyOn(
        rwtRepo as any,
        'getBoxFromExplorer'
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromExplorer).toHaveBeenCalled();
      expect(rwtRepo['box']).toBe(currentBox);
    });

    /**
     * @target updateBox(true) of RWTRepo created with
     * networkType=ErgoNetworkType.Explorer argument, should update the box
     * member variable with ErgoBox created from the unspent box info received
     * from explorer mempool api for the corresponding repoAddress and repoNft
     * set on this instance
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Explorer
     * and specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox(true) to update RWTRepo.box from mempool
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromExplorerMempool private method has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromExplorerMempool private method should have been called
     */
    it(`updateBox(true) of RWTRepo created with
    networkType=ErgoNetworkType.Explorer argument, should update the box member
    variable with ErgoBox created from the unspent box info received from
    explorer mempool api for the corresponding repoAddress and repoNft set on this instance`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      const spyGetBoxFromExplorerMempool = jest.spyOn(
        rwtRepo as any,
        'getBoxFromExplorerMempool'
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(true);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromExplorerMempool).toHaveBeenCalled();
    });

    /**
     * @target updateBox of RWTRepo created with
     * networkType=ErgoNetworkType.Node argument, should update the box
     * member variable with ErgoBox created from the unspent box info received
     * from node api for the corresponding repoAddress and repoNft set on
     * this instance
     * @dependencies
     * - mockedErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * and specific repoAddress and repoNft
     * - mock RWTRepo.nodeClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromNode private method has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromNode private method should have been called
     */
    it(`updateBox of RWTRepo created with networkType=ErgoNetworkType.Node
    argument, should update the box member variable with ErgoBox created from
    the unspent box info received from node api for the corresponding
    repoAddress and repoNft set on this instance`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Node,
        ''
      );

      const spyGetBoxFromNode = jest.spyOn(rwtRepo as any, 'getBoxFromNode');

      rwtRepo['nodeClient'] = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromNode).toHaveBeenCalled();
    });

    /**
     * @target updateBox(true) of RWTRepo created with
     * networkType=ErgoNetworkType.Node argument, should update the box
     * member variable with ErgoBox created from the unspent box info received
     * from node mempool api for the corresponding repoAddress and repoNft set
     * on this instance
     * @dependencies
     * - mockedErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * and specific repoAddress and repoNft
     * - mock RWTRepo.nodeClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox(true) to update RWTRepo.box from mempool
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromNodeMempool private method has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromNodeMempool private method should have been called
     */
    it(`updateBox(true) of RWTRepo created with networkType=ErgoNetworkType.Node
    argument, should update the box member variable with ErgoBox created from
    the unspent box info received from node mempool api for the corresponding
    repoAddress and repoNft set on this instance`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Node,
        ''
      );

      const spyGetBoxFromNodeMempool = jest.spyOn(
        rwtRepo as any,
        'getBoxFromNodeMempool'
      );

      rwtRepo['nodeClient'] = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;

      await rwtRepo.updateBox(true);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromNodeMempool).toHaveBeenCalled();
    });

    /**
     * @target updateBox of RWTRepo created with
     * networkType=ErgoNetworkType.Node argument, should not update the box
     * member variable if it has a value and it's still unspent
     * @dependencies
     * - mockedErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * and specific repoAddress and repoNft
     * - assign an ErgoBox to RWTRepo.box
     * - mock RWTRepo.nodeClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to check if it should update the box
     * - check RWTRepo.box to be populated with correct info
     * - check if RWTRepo.getBoxFromNode private method has been called
     * - check if RWTRepo.box is not changed and not replaced with a new
     * instance
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - RWTRepo.getBoxFromNode private method should have been called
     * - RWTRepo.box should not be changed and not replaced with a new instance
     */
    it(`updateBox of RWTRepo created with networkType=ErgoNetworkType.Node
    argument, should not update the box member variable if it has a value and
    it's still unspent`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Node,
        ''
      );

      const currentBox = ErgoBox.from_json(
        jsonBigInt.stringify(rwtRepoInfoSample.BoxInfo)
      );
      rwtRepo['box'] = currentBox;

      const spyGetBoxFromNode = jest.spyOn(rwtRepo as any, 'getBoxFromNode');

      rwtRepo['nodeClient'] = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromNode).toHaveBeenCalled();
      expect(rwtRepo['box']).toBe(currentBox);
    });
  });
});
