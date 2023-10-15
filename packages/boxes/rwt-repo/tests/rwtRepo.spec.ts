import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { Constant, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { RWTRepo, RWTRepoBuilder } from '../lib';
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
        rwtRepoInfoSample.boxInfo.boxId
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
        jsonBigInt.stringify(rwtRepoInfoSample.boxInfo)
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
        rwtRepoInfoSample.boxInfo.boxId
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
        rwtRepoInfoSample.boxInfo.boxId
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
        rwtRepoInfoSample.boxInfo.boxId
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
        rwtRepoInfoSample.boxInfo.boxId
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
        jsonBigInt.stringify(rwtRepoInfoSample.boxInfo)
      );
      rwtRepo['box'] = currentBox;

      const mockedNodeClient = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;
      const spyGetBoxFromNode = jest.spyOn(mockedNodeClient, 'getBoxById');
      rwtRepo['nodeClient'] = mockedNodeClient;

      await rwtRepo.updateBox(false);

      expect(rwtRepo['box']?.box_id().to_str()).toEqual(
        rwtRepoInfoSample.boxInfo.boxId
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
          rwtRepoInfoSample.boxInfo.additionalRegisters.R6.renderedValue
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

  describe('getRsnCollateral', () => {
    /**
     * @target RWTRepo.getRsnCollateral should return a bigint with the value
     * stored in R6[5] of RWTRepo.box
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getRsnCollateral() to return the correct value
     * @expected
     * - RWTRepo.getRsnCollateral() should return the correct value
     */
    it(`RWTRepo.getRsnCollateral should return a bigint with the value stored in
    R6[5] of RWTRepo.box`, async () => {
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

      expect(rwtRepo.getRsnCollateral()).toEqual(
        jsonBigInt.parse(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R6.renderedValue
        )[5]
      );
    });

    /**
     * @target RWTRepo.getRsnCollateral should throw an exception when
     * RWTRepo.box is undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getRsnCollateral() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
     * - RWTRepo.getRsnCollateral() should throw exception
     */
    it(`RWTRepo.getRsnCollateral should throw an exception when RWTRepo.box is
    undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getRsnCollateral()).toThrowError();
    });
  });

  describe('getRequiredCommitmentCount', () => {
    /**
     * @target RWTRepo.getRequiredCommitmentCount should the value of the second
     * argument of the following formula, when R6[3] is the greater value:
     * min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - RWTRepo.getRequiredCommitmentCount() should return the correct value
     */
    it(`RWTRepo.getRequiredCommitmentCount should the value of the second
    argument of the following formula, when R6[3] is the greater value:
    min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      const boxInfo = rwtRepoInfoSample.boxInfo2;

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        '',
        boxInfo
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(false);

      const r6 = Constant.decode_from_base16(boxInfo.additionalRegisters.R6)
        .to_i64_str_array()
        .map(BigInt);
      const r4 = Constant.decode_from_base16(
        boxInfo.additionalRegisters.R4
      ).to_coll_coll_byte();

      expect(rwtRepo.getRequiredCommitmentCount()).toEqual(
        (r6[1] * BigInt(r4.length - 1)) / 100n + r6[2]
      );
    });

    /**
     * @target RWTRepo.getRequiredCommitmentCount should return R6[3], when
     * R6[3] is the lower value in the following formula:
     * min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - RWTRepo.getRequiredCommitmentCount() should return the correct value
     */
    it(`RWTRepo.getRequiredCommitmentCount should return R6[3], when R6[3] is
    the lower value in the following formula:
    min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])`, async () => {
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

      const boxInfo = rwtRepoInfoSample.boxInfo;
      const r6 = Constant.decode_from_base16(
        boxInfo.additionalRegisters.R6.serializedValue
      )
        .to_i64_str_array()
        .map(BigInt);

      expect(rwtRepo.getRequiredCommitmentCount()).toEqual(r6[3]);
    });

    /**
     * @target RWTRepo.getRequiredCommitmentCount should throw an exception when
     * RWTRepo.box is undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getRequiredCommitmentCount() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
     * - RWTRepo.getRequiredCommitmentCount() should throw exception
     */
    it(`RWTRepo.getRequiredCommitmentCount should throw an exception when
    RWTRepo.box is undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getRequiredCommitmentCount()).toThrowError();
    });
  });

  describe('getCommitmentRwtCount', () => {
    /**
     * @target RWTRepo.getCommitmentRwtCount should return a bigint with the
     * value stored in R6[0] of RWTRepo.box
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getCommitmentRwtCount() to return the correct value
     * @expected
     * - RWTRepo.getCommitmentRwtCount() should return the correct value
     */
    it(`RWTRepo.getCommitmentRwtCount should return a bigint with the value
    stored in R6[0] of RWTRepo.box`, async () => {
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

      const r6 = Constant.decode_from_base16(
        rwtRepoInfoSample.boxInfo.additionalRegisters.R6.serializedValue
      )
        .to_i64_str_array()
        .map(BigInt);

      expect(rwtRepo.getCommitmentRwtCount()).toEqual(r6.at(0));
    });

    /**
     * @target RWTRepo.getCommitmentRwtCount should throw an exception when
     * RWTRepo.box is undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getCommitmentRwtCount() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
     * - RWTRepo.getCommitmentRwtCount() should throw exception
     */
    it(`RWTRepo.getCommitmentRwtCount should throw an exception when RWTRepo.box
    is undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getCommitmentRwtCount()).toThrowError();
    });
  });

  describe('getWidIndex', () => {
    /**
     * @target RWTRepo.getWidIndex should return index of wid (watcher id) in R4
     * register of RWTRepo.box
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getWidIndex() to return the index wid in R4
     * @expected
     * - RWTRepo.getWidIndex() should return the index wid in R4
     */
    it(`RWTRepo.getWidIndex should return index of wid (watcher id) in R4
    register of RWTRepo.box`, async () => {
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

      const r4_2 = Constant.decode_from_base16(
        rwtRepoInfoSample.boxInfo.additionalRegisters.R4.serializedValue
      ).to_coll_coll_byte()[2];

      expect(rwtRepo.getWidIndex(Buffer.from(r4_2).toString('hex'))).toEqual(2);
    });

    /**
     * @target RWTRepo.getWidIndex should return -1 if wid (watcher id) is not
     * present in R4 register of RWTRepo.box
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getWidIndex() to return -1
     * @expected
     * - RWTRepo.getWidIndex() should return -1
     */
    it(`RWTRepo.getWidIndex should return -1 if wid (watcher id) is not present
    in R4 register of RWTRepo.box`, async () => {
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

      expect(rwtRepo.getWidIndex('ff4a5b')).toEqual(-1);
    });

    /**
     * @target RWTRepo.getWidIndex should throw an exception when RWTRepo.box is
     * undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getWidIndex() to throw exception
     * @expected
     * - RWTRepo.getWidIndex() should throw exception
     */
    it(`RWTRepo.getWidIndex should throw an exception when RWTRepo.box is
    undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(() => rwtRepo.getWidIndex('6572676f')).toThrowError();
    });
  });

  describe('getPermitCount', () => {
    /**
     * @target RWTRepo.getPermitCount should return permitCount for a wid which
     * is equal to RWTRepo.box.R5[widIndex]. widIndex is the index of wid in the
     * RWTRepo.box.R4 register
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getPermitCount() to extract and return correct
     * permitCount from RWTRepo.box.R5 register
     * @expected
     * - RWTRepo.getPermitCount() should extract and return correct permitCount
     * from RWTRepo.box.R5 register
     */
    it(`RWTRepo.getPermitCount should return permitCount for a wid which is
    equal to RWTRepo.box.R5[widIndex]. widIndex is the index of wid in the
    RWTRepo.box.R4 register`, async () => {
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

      const r4_2 = Constant.decode_from_base16(
        rwtRepoInfoSample.boxInfo.additionalRegisters.R4.serializedValue
      ).to_coll_coll_byte()[2];

      const r5 = (
        Constant.decode_from_base16(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R5.serializedValue
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      expect(rwtRepo.getPermitCount(Buffer.from(r4_2).toString('hex'))).toEqual(
        r5[2]
      );
    });

    /**
     * @target RWTRepo.getPermitCount should return 0 for a wid doesn't exist in
     * RWTRepo.box.R4 register
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.getPermitCount() to return 0 for a missing wid
     * @expected
     * - RWTRepo.getPermitCount() should return 0 for a missing wid
     */
    it(`RWTRepo.getPermitCount should return 0 for a wid doesn't exist in
    RWTRepo.box.R4 register`, async () => {
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

      expect(rwtRepo.getPermitCount('ff4a5b')).toEqual(0n);
    });

    /**
     * @target RWTRepo.getPermitCount should throw an exception when RWTRepo.box
     * is undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.getPermitCount() to throw exception
     * @expected
     * - RWTRepo.getPermitCount() should throw exception
     */
    it(`RWTRepo.getPermitCount should throw an exception when RWTRepo.box is
    undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(() => rwtRepo.getPermitCount('faer')).toThrowError();
    });
  });

  describe('toBuilder', () => {
    /**
     * @target RWTRepo.toBuilder should create and return an instance of
     * RWTRepoBuilder with correct parameters taken from the rwtRepo instance
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - check RWTRepo.toBuilder() to return an instance of RWTRepoBuilder
     * - check RWTRepo.toBuilder() to have created the RWTRepoBuilder instance
     * with correct parameters
     * @expected
     * - check RWTRepo.toBuilder() should return an instance of RWTRepoBuilder
     * - check RWTRepo.toBuilder() should have created the RWTRepoBuilder
     * instance with correct parameters
     */
    it(`RWTRepo.toBuilder should create and return an instance of RWTRepoBuilder
    with correct parameters taken from the rwtRepo instance`, async () => {
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

      const rwtRepoBuilder = rwtRepo.toBuilder();

      const r4 = Constant.decode_from_base16(
        rwtRepoInfoSample.boxInfo.additionalRegisters.R4.serializedValue
      ).to_coll_coll_byte();

      const r5 = (
        Constant.decode_from_base16(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R5.serializedValue
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      const r6 = (
        Constant.decode_from_base16(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R6.serializedValue
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      const widPermits = r4
        .slice(1)
        ?.map((wid) => Buffer.from(wid).toString('hex'))
        .map((wid, i) => {
          return { wid, rwtCount: r5[i + 1] };
        });

      const rwtCount = BigInt(rwtRepoInfoSample.boxInfo.assets[1].amount);
      const rsnToken = rwtRepoInfoSample.boxInfo.assets[2];

      expect(rwtRepoBuilder).toBeInstanceOf(RWTRepoBuilder);
      expect(rwtRepoBuilder['repoAddress']).toEqual(rwtRepo['repoAddress']);
      expect(rwtRepoBuilder['repoNft']).toEqual(rwtRepo['repoNft']);
      expect(rwtRepoBuilder['rwt']).toEqual(rwtRepo['rwt']);
      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtCount);
      expect(rwtRepoBuilder['rsn']).toEqual(rsnToken.tokenId);
      expect(rwtRepoBuilder['rsnCount']).toEqual(BigInt(rsnToken.amount));
      expect(rwtRepoBuilder['chainId']).toEqual(Buffer.from(r4[0]).toString());
      expect(rwtRepoBuilder['commitmentRwtCount']).toEqual(
        rwtRepo.getCommitmentRwtCount()
      );
      expect(rwtRepoBuilder['quorumPercentage']).toEqual(Number(r6.at(1)));
      expect(rwtRepoBuilder['approvalOffset']).toEqual(Number(r6.at(2)));
      expect(rwtRepoBuilder['maximumApproval']).toEqual(Number(r6.at(3)));
      expect(rwtRepoBuilder['ergCollateral']).toEqual(
        rwtRepo.getErgCollateral()
      );
      expect(rwtRepoBuilder['rsnCollateral']).toEqual(
        rwtRepo.getRsnCollateral()
      );
      expect(rwtRepoBuilder['widPermits']).toEqual(widPermits);
    });

    /**
     * @target RWTRepo.toBuilder should throw an exception when RWTRepo.box is
     * undefined
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - check RWTRepo.toBuilder() to throw exception
     * @expected
     * - RWTRepo.toBuilder() should throw exception
     */
    it(`RWTRepo.toBuilder should throw an exception when RWTRepo.box is
    undefined`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      expect(() => rwtRepo.toBuilder()).toThrowError();
    });
  });
});

describe('RWTRepoBuilder', () => {
  let rwtRepoBuilder: RWTRepoBuilder;
  beforeEach(() => {
    const boxInfo = rwtRepoInfoSample.boxInfo;

    const r4 = Constant.decode_from_base16(
      boxInfo.additionalRegisters.R4.serializedValue
    ).to_coll_coll_byte();

    const r5 = (
      Constant.decode_from_base16(
        boxInfo.additionalRegisters.R5.serializedValue
      ).to_i64_str_array() as string[]
    ).map(BigInt);

    const r6 = (
      Constant.decode_from_base16(
        boxInfo.additionalRegisters.R6.serializedValue
      ).to_i64_str_array() as string[]
    ).map(BigInt);

    const widPermits = r4
      .slice(1)
      ?.map((wid) => Buffer.from(wid).toString('hex'))
      .map((wid, i) => {
        return { wid, rwtCount: r5[i + 1] };
      });

    rwtRepoBuilder = new RWTRepoBuilder(
      rwtRepoInfoSample.Address,
      rwtRepoInfoSample.nft,
      boxInfo.assets[1].tokenId,
      BigInt(boxInfo.assets[1].amount),
      boxInfo.assets[2].tokenId,
      BigInt(boxInfo.assets[2].amount),
      Buffer.from(r4[0]).toString(),
      r6[0],
      Number(r6[1]),
      Number(r6[2]),
      Number(r6[3]),
      r6[4],
      r6[5],
      widPermits
    );
  });

  describe('addNewUser', () => {
    /**
     * @target RWTRepo.addNewUser should add the passed wid, rwtCount arguments
     * to this.widPermits, and do the following updates:
     * this.rwtCount -= rwtCount
     * this.rsnCount += rsnCount
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser
     * - check RWTRepoBuilder.widPermits to not have contained the new wid
     * before RWTRepoBuilder.addNewUser
     * - check RWTRepoBuilder.widPermits to contain the new wid after
     * RWTRepoBuilder.addNewUser as the last item
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - RWTRepoBuilder.widPermits should not have contained the new wid before
     * RWTRepoBuilder.addNewUser
     * - RWTRepoBuilder.widPermits should contain the new wid after
     * RWTRepoBuilder.addNewUser as the last item
     * - RWTRepoBuilder.rwtCount should have been updated correctly
     * - RWTRepoBuilder.rsnCount should have been updated correctly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`should add the passed wid, rwtCount arguments to
    this.widPermits, and do the following updates:
    this.rwtCount -= rwtCount
    this.rsnCount += rsnCount`, async () => {
      const wid = '34f2a6bb';
      const rwtCount = 2n;
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.addNewUser(wid, rwtCount);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        false
      );
      expect(
        rwtRepoBuilder['widPermits'][rwtRepoBuilder['widPermits'].length - 1]
          .wid
      ).toEqual(wid);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + rwtCount);
    });

    /**
     * @target should throw exception when passed rwtCount as argument is
     * greater than available rwtCount
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser with a rwtCount greater than
     * this.rwtCount
     * - check RWTRepoBuilder.addNewUser to throw an exception
     * @expected
     * - RWTRepoBuilder.addNewUser should throw an exception
     */
    it(`should throw exception when passed rwtCount as argument is greater than
    available rwtCount`, async () => {
      const wid = '34f2a6bb';

      expect(() =>
        rwtRepoBuilder.addNewUser(wid, rwtRepoBuilder['rwtCount'] + 1n)
      ).toThrowError();
    });

    /**
     * @target should throw exception when adding an existing wid
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser with an existing wid
     * - check RWTRepoBuilder.addNewUser to throw an exception
     * @expected
     * - RWTRepoBuilder.addNewUser should throw an exception
     */
    it(`should throw exception when adding an existing wid`, async () => {
      expect(() =>
        rwtRepoBuilder.addNewUser(rwtRepoBuilder['widPermits'][0].wid, 1n)
      ).toThrowError();
    });
  });

  describe('removeUser', () => {
    /**
     * @target RWTRepo.removeUser should remove the item with the passed wid
     * from this.widPermits, and do the following updates:
     * this.rwtCount += rwtCount
     * this.rsnCount -= rsnCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.widPermits to have contained the passed wid before
     * calling RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.widPermits not to contain the passed wid after
     * RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - RWTRepoBuilder.widPermits should have contained the passed wid before
     * calling RWTRepoBuilder.removeUser
     * - RWTRepoBuilder.widPermits should not contain the passed wid after
     * calling RWTRepoBuilder.removeUser
     * - RWTRepoBuilder.rwtCount should have been updated correctly
     * - RWTRepoBuilder.rsnCount should have been updated correctly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepo.removeUser should remove the item with the passed wid from
    this.widPermits, and do the following updates:
    this.rwtCount += rwtCount
    this.rsnCount -= rsnCount`, async () => {
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

      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 2;
      const { wid, rwtCount } = rwtRepoBuilder['widPermits'][widIndex];
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.removeUser(wid);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        true
      );
      expect(
        rwtRepoBuilder['widPermits'].map((permit) => permit.wid).includes(wid)
      ).toEqual(false);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - rwtCount);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });

    /**
     * @target should throw exception when removing a non-existent wid
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.removeUser with a non-existent wid
     * - check RWTRepoBuilder.removeUser to throw an exception
     * @expected
     * - RWTRepoBuilder.removeUser should throw an exception
     */
    it(`should throw exception when removing a non-existent wid`, async () => {
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      expect(() => rwtRepoBuilder.removeUser('abcd')).toThrowError();
      expect(rwtRepoBuilder['widPermits']).toEqual(oldWidPermits);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount);
    });
  });

  describe('setCommitmentRwtCount', () => {
    /**
     * @target RWTRepoBuilder.setCommitmentRwtCount should set value of
     * RWTRepoBuilder.commitmentRwtCount and return its RWTRepoBuilder's
     * instance (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setCommitmentRwtCount
     * - check return value of RWTRepoBuilder.setCommitmentRwtCount to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.commitmentRwtCount to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setCommitmentRwtCount should be the
     * current instance of RWTRepoBuilder
     * - RWTRepoBuilder.commitmentRwtCount should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setCommitmentRwtCount should set value of
    RWTRepoBuilder.commitmentRwtCount and return its RWTRepoBuilder's instance
    (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newCommitmentRwtCount = 123n;
      const returnValue = rwtRepoBuilder.setCommitmentRwtCount(
        newCommitmentRwtCount
      );

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['commitmentRwtCount']).toEqual(
        newCommitmentRwtCount
      );
    });
  });

  describe('setWatcherQuorumPercentage', () => {
    /**
     * @target RWTRepoBuilder.setWatcherQuorumPercentage should set value of
     * RWTRepoBuilder.quorumPercentage and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setWatcherQuorumPercentage
     * - check return value of RWTRepoBuilder.setWatcherQuorumPercentage to be
     * the current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.quorumPercentage to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setWatcherQuorumPercentage should be the
     * current instance of RWTRepoBuilder
     * - RWTRepoBuilder.quorumPercentage should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setWatcherQuorumPercentage should set value of
    RWTRepoBuilder.quorumPercentage and return its RWTRepoBuilder's instance
    (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newQuorumPercentage = 83;
      const returnValue =
        rwtRepoBuilder.setWatcherQuorumPercentage(newQuorumPercentage);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['quorumPercentage']).toEqual(newQuorumPercentage);
    });
  });

  describe('setApprovalOffset', () => {
    /**
     * @target RWTRepoBuilder.setApprovalOffset should set value of
     * RWTRepoBuilder.approvalOffset and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setApprovalOffset
     * - check return value of RWTRepoBuilder.setApprovalOffset to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.approvalOffset to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setApprovalOffset should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.approvalOffset should have been set to the correct value
     */
    it(`RWTRepoBuilder.setApprovalOffset should set value of
    RWTRepoBuilder.approvalOffset and return its RWTRepoBuilder's instance
    (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newApprovalOffset = 5;
      const returnValue = rwtRepoBuilder.setApprovalOffset(newApprovalOffset);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['approvalOffset']).toEqual(newApprovalOffset);
    });
  });

  describe('setMaximumApproval', () => {
    /**
     * @target RWTRepoBuilder.setMaximumApproval should set value of
     * RWTRepoBuilder.maximumApproval and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setMaximumApproval
     * - check return value of RWTRepoBuilder.setMaximumApproval to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.maximumApproval to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setMaximumApproval should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.maximumApproval should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setMaximumApproval should set value of
    RWTRepoBuilder.maximumApproval and return its RWTRepoBuilder's instance
    (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newMaximumApproval = 14;
      const returnValue = rwtRepoBuilder.setMaximumApproval(newMaximumApproval);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['maximumApproval']).toEqual(newMaximumApproval);
    });
  });

  describe('setErgCollateral', () => {
    /**
     * @target RWTRepoBuilder.setErgCollateral should set value of
     * RWTRepoBuilder.ergCollateral and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setErgCollateral
     * - check return value of RWTRepoBuilder.setErgCollateral to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.ergCollateral to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setErgCollateral should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.ergCollateral should have been set to the correct value
     */
    it(`RWTRepoBuilder.setErgCollateral should set value of
    RWTRepoBuilder.ergCollateral and return its RWTRepoBuilder's instance (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newErgCollateral = 23n;
      const returnValue = rwtRepoBuilder.setErgCollateral(newErgCollateral);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['ergCollateral']).toEqual(newErgCollateral);
    });
  });

  describe('setRsnCollateral', () => {
    /**
     * @target RWTRepoBuilder.setRsnCollateral should set value of
     * RWTRepoBuilder.rsnCollateral and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setRsnCollateral
     * - check return value of RWTRepoBuilder.setRsnCollateral to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.rsnCollateral to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setRsnCollateral should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.rsnCollateral should have been set to the correct value
     */
    it(`RWTRepoBuilder.setRsnCollateral should set value of
    RWTRepoBuilder.rsnCollateral and return its RWTRepoBuilder's instance (this)`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newRsnCollateral = 34n;
      const returnValue = rwtRepoBuilder.setRsnCollateral(newRsnCollateral);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rsnCollateral']).toEqual(newRsnCollateral);
    });
  });

  describe('decrementPermits', () => {
    /**
     * @target RWTRepoBuilder.decrementPermits should decrement rwtCount for a
     * specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
     * should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
     * current RWTRepoBuilder (this), and do the following updates:
     * RWTRepoBuilder.rwtCount -= rwtCount
     * RWTRepoBuilder.rsnCount += rwtCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.decrementPermits
     * - check return value of RWTRepoBuilder.decrementPermits to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.widPermits to have been updated correctly
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - return value of RWTRepoBuilder.decrementPermits should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.widPermits should have been decremented accordingly
     * - RWTRepoBuilder.rwtCount should have been decremented accordingly
     * - RWTRepoBuilder.rsnCount should have been incremented accordingly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepoBuilder.decrementPermits should decrements rwtCount for a
    specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
    should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
    current RWTRepoBuilder (this), and do the following updates:
    RWTRepoBuilder.rwtCount -= rwtCount
    RWTRepoBuilder.rsnCount += rwtCount`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 2;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const decrement = 45n;
      const returnValue = rwtRepoBuilder.decrementPermits(wid, decrement);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount - decrement
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - decrement);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + decrement);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });

  describe('incrementPermits', () => {
    /**
     * @target RWTRepoBuilder.incrementPermits should increment rwtCount for a
     * specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
     * should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
     * current RWTRepoBuilder (this), and do the following updates:
     * RWTRepoBuilder.rwtCount += rwtCount
     * RWTRepoBuilder.rsnCount -= rwtCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.incrementPermits
     * - check return value of RWTRepoBuilder.incrementPermits to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.widPermits to have been updated correctly
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - return value of RWTRepoBuilder.incrementPermits should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.widPermits should have been incremented accordingly
     * - RWTRepoBuilder.rwtCount should have been incremented accordingly
     * - RWTRepoBuilder.rsnCount should have been decremented accordingly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepoBuilder.incrementPermits should increment rwtCount for a
    specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
    should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
    current RWTRepoBuilder (this), and do the following updates:
    RWTRepoBuilder.rwtCount += rwtCount
    RWTRepoBuilder.rsnCount -= rwtCount`, async () => {
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
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 3;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const increment = 56n;
      const returnValue = rwtRepoBuilder.incrementPermits(wid, increment);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount + increment
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + increment);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - increment);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });
});
