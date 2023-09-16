import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { Constant, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { jsonBigInt } from '../lib/utils';
import { rwtRepoInfoSample } from './rwt-repo-TestData';
import {
  mockedErgoExplorerClientFactory,
  mockedErgoNodeClientFactory,
} from './rwt-repo.mock';

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
    the unspent box info received from explorere api for the corresponding
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
        jsonBigInt.stringify(rwtRepoInfoSample.boxInfo)
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
        jsonBigInt.stringify(rwtRepoInfoSample.boxInfo)
      );
      rwtRepo['box'] = currentBox;

      const spyGetBoxFromNode = jest.spyOn(rwtRepo as any, 'getBoxFromNode');

      rwtRepo['nodeClient'] = mockedErgoNodeClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoNodeClientFactory>;

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
     * arguement of the following formula, when R6[3] is the greater value:
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
    arguement of the following formula, when R6[3] is the greater value:
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
     * - RWTRepo.box should be undefined
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

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getCommitmentRwtCount()).toThrowError();
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
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.getPermitCount() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
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

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.getPermitCount('faer')).toThrowError();
    });
  });

  describe('toBuilder', () => {
    /**
     * @target RWTRepo.toBuilder should create and return an instance of RWTRepoBuilder
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

      const rwtRepoBuilder = rwtRepo.toBuilder();

      const r4 = Constant.decode_from_base16(
        rwtRepoInfoSample.boxInfo.additionalRegisters.R4.serializedValue
      ).to_coll_coll_byte();

      const r5 = (
        Constant.decode_from_base16(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R5.serializedValue
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      const widPermits = r4
        ?.map((wid) => Buffer.from(wid).toString('hex'))
        .map((wid, i) => {
          return { wid, rwtCount: r5[i] };
        });

      const r6 = (
        Constant.decode_from_base16(
          rwtRepoInfoSample.boxInfo.additionalRegisters.R6.serializedValue
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      expect(rwtRepoBuilder).toBeInstanceOf(RWTRepoBuilder);
      expect(rwtRepoBuilder['repoAddress']).toEqual(rwtRepo['repoAddress']);
      expect(rwtRepoBuilder['repoNft']).toEqual(rwtRepo['repoNft']);
      expect(rwtRepoBuilder['rwt']).toEqual(rwtRepo['rwt']);
      expect(rwtRepoBuilder['networkType']).toEqual(rwtRepo['networkType']);
      expect(rwtRepoBuilder['networkUrl']).toEqual(rwtRepo['networkUrl']);
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
     * - check RWTRepo.box to be undefined
     * - check RWTRepo.toBuilder() to throw exception
     * @expected
     * - RWTRepo.box should be undefined
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

      expect(rwtRepo['box']).toBeUndefined();
      expect(() => rwtRepo.toBuilder()).toThrowError();
    });
  });
});
