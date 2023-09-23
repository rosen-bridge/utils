import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { RWTRepo } from '../lib';
import { jsonBigInt } from '../lib/utils';
import {
  mockedErgoExplorerClientFactory,
  mockedErgoNodeClientFactory,
} from './rwtRepo.mock';
import { rwtRepoInfoSample } from './rwtRepoTestData';

describe('RWTRepo', () => {
  describe('updateBox', () => {
    beforeEach(() => {
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
     * - check if Explorer client api has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - Explorer client api should have been called
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

      const mockedExplorerClient = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      const spyGetBoxFromExplorer = jest.spyOn(
        mockedExplorerClient.v1,
        'getApiV1BoxesUnspentByaddressP1'
      );
      rwtRepo['explorerClient'] = mockedExplorerClient;

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
     * - check if Explorer client api has been called
     * - check if RWTRepo.box is not changed and not replaced with a new
     * instance
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - Explorer client api should have been called
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

      const mockedExplorerClient = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      const spyGetBoxFromExplorer = jest.spyOn(
        mockedExplorerClient.v1,
        'getApiV1BoxesP1'
      );
      rwtRepo['explorerClient'] = mockedExplorerClient;

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
     * - check if explorer client mempool api has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - explorer client mempool api should have been called
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

      const mockedExplorerClient = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      const spyGetBoxFromExplorerMempool = jest.spyOn(
        mockedExplorerClient.v0,
        'getApiV0TransactionsUnconfirmedByaddressP1'
      );
      rwtRepo['explorerClient'] = mockedExplorerClient;

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
     * - check if node client api has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - node client api should have been called
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

      const mockedNodeClient = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;
      const spyGetBoxFromNode = jest.spyOn(
        mockedNodeClient,
        'getBoxesByAddressUnspent'
      );
      rwtRepo['nodeClient'] = mockedNodeClient;

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
     * - - check if node client mempool api has been called
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - node client mempool api should have been called
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

      const mockedNodeClient = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;
      const spyGetBoxFromNodeMempool = jest.spyOn(
        mockedNodeClient,
        'getUnconfirmedTransactionsByErgoTree'
      );
      rwtRepo['nodeClient'] = mockedNodeClient;

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
     * - check if node client api has been called
     * - check if RWTRepo.box is not changed and not replaced with a new
     * instance
     * @expected
     * - RWTRepo.box should be populated with correct info
     * - node client api should have been called
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

      const mockedNodeClient = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;
      const spyGetBoxFromNode = jest.spyOn(mockedNodeClient, 'getBoxById');
      rwtRepo['nodeClient'] = mockedNodeClient;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.BoxInfo.boxId
      );
      expect(spyGetBoxFromNode).toHaveBeenCalled();
      expect(rwtRepo['box']).toBe(currentBox);
    });
  });

  describe('getErgCollateral', () => {
    /**
     * @target RWTRepo.getErgCollateral should return a bigint with the value
     * stores in R6[4] of RWTRepo.box
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getErgCollateral() to return the correct value
     * @expected
     * - RWTRepo.getErgCollateral() should return the correct value
     */
    it(`RWTRepo.getErgCollateral should return a bigint with the value stores in
    R6[4] of RWTRepo.box`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(false);

      expect(rwtRepo.getErgCollateral()).toEqual(
        jsonBigInt.parse(
          rwtRepoInfoSample.BoxInfo.additionalRegisters.R6.renderedValue
        )[4]
      );
    });

    /**
     * @target RWTRepo.getErgCollateral should throw an exception when
     * RWTRepo.box is undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getErgCollateral() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
     * - RWTRepo.getErgCollateral() should throw exception
     */
    it(`RWTRepo.getErgCollateral should throw an exception when RWTRepo.box is
    undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getErgCollateral()).toThrowError();
    });
  });
});
