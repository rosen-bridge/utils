import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { Constant, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { jsonBigInt } from '../lib/utils';
import { mockedErgoExplorerClientFactory } from './mocked/ergoExplorerClient.mock';
import { mockedErgoNodeClientFactory } from './mocked/ergoNodeClient.mock';
import { rwtRepoInfoSample } from './rwtRepoTestData';

describe('RWTRepo', () => {
  describe('updateBox', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    /**
     * @target should update the this.box with RWTRepo box info received from
     * explorer api
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Explorer
     *   and specific repoAddress and repoNft
     * - mock this.explorerClient
     * - call this.updateBox to update this.box
     * - check this.box to be populated with correct info
     * - check if Explorer client api has been called
     * @expected
     * - this.box should be populated with correct info
     * - Explorer client api should have been called
     */
    it(`should update the this.box with RWTRepo box info received from explorer
    api`, async () => {
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
      const spyGetBoxFromExplorer = vi.spyOn(
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
     * @target should not update the box member variable if it has a value and
     * it's still unspent
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Explorer
     *   and specific repoAddress and repoNft
     * - assign an ErgoBox to this.box
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.box to be populated with correct info
     * - check if Explorer client api has been called
     * - check if this.box is not changed and not replaced with a new instance
     * @expected
     * - this.box should be populated with correct info
     * - Explorer client api should have been called
     * - this.box should not have be changed and not replaced with a new
     *   instance
     */
    it(`should not update the box member variable if it has a value and it's
    still unspent`, async () => {
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
      const spyGetBoxFromExplorer = vi.spyOn(
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
     * @target should update the this.box with RWTRepo box info received from
     * explorer mempool api when passed true as argument
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with
     * - mock this.explorerClient
     * - call this.updateBox(true) to update this.box from mempool
     * - check this.box to thisbe populated with correct info
     * - check if explorer client mempool api has been called
     * @expected
     * - this.box should be populated with correct info
     * - explorer client mempool api should have been called
     */
    it(`should update the this.box with RWTRepo box info received from explorer
    mempool api when passed true as argument`, async () => {
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
      const spyGetBoxFromExplorerMempool = vi.spyOn(
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
     * @target it should update this.box with RWTRepo box info received from
     * node api
     * @dependencies
     * - ErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * - mock this.nodeClient
     * - call this.updateBox to update this.box
     * - check this.box to be populated with correct info
     * - check if node client api has been called
     * @expected
     * - this.box should be populated with correct info
     * - node client api should have been called
     */
    it(`it should update this.box with RWTRepo box info received from node api`, async () => {
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
      const spyGetBoxFromNode = vi.spyOn(
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
     * @target should update this.box with RWTRepo box info received form node
     * mempool api
     * @dependencies
     * - ErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * - mock this.nodeClient
     * - call this.updateBox(true)
     * - check this.box to be populated with correct info
     * - check if node client mempool api has been called
     * @expected
     * - this.box should be populated with correct info
     * - node client mempool api should have been called
     */
    it(`should update this.box with RWTRepo box info received form node mempool
    api`, async () => {
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
      const spyGetBoxFromNodeMempool = vi.spyOn(
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
     * @target it should not update the box member variable if it has a value
     * and it's still unspent (node api version)
     * @dependencies
     * - ErgoNodeClientFactory
     * @scenario
     * - create an instance of RWTRepo with networkType=ErgoNetworkType.Node
     * - assign an ErgoBox to this.box
     * - mock this.nodeClient
     * - call this.updateBox
     * - check this.box to be populated with correct info
     * - check if node client api has been called
     * - check if this.box is not changed and not replaced with a new instance
     * @expected
     * - this.box should be populated with correct info
     * - node client api should have been called
     * - this.box should not have been changed and not replaced with a new
     *   instance
     */
    it(`it should not update the box member variable if it has a value and it's
    still unspent (node api version)`, async () => {
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
      const spyGetBoxFromNode = vi.spyOn(mockedNodeClient, 'getBoxById');
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
     * @target should return a bigint with the value stored in R6[4] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox to update this.box
     * - check this.getErgCollateral() to return the correct value
     * @expected
     * - this.getErgCollateral() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[4] of this.box`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.box to be undefined
     * - check this.getErgCollateral() to throw exception
     * @expected
     * - this.box should be undefined
     * - this.getErgCollateral() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
     * @target should return a bigint with the value stored in R6[5] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox to update this.box
     * - check this.getRsnCollateral() to return the correct value
     * @expected
     * - this.getRsnCollateral() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[5] of this.box`, async () => {
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
     * @target this.getRsnCollateral should throw an exception when this.box is
     * undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.box to be undefined
     * - check this.getRsnCollateral() to throw exception
     * @expected
     * - this.box should be undefined
     * - this.getRsnCollateral() should throw exception
     */
    it(`this.getRsnCollateral should throw an exception when this.box is
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
     * @target should return (R6[1] * (len(R4) - 1) / 100 + R6[2]), when it is
     * less than R6[3]
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - this.getRequiredCommitmentCount() should return the correct value
     */
    it(`should return (R6[1] * (len(R4) - 1) / 100 + R6[2]), when it is less
    than R6[3]`, async () => {
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
     * R6[3] is less than (R6[1] * (len(R4) - 1) / 100 + R6[2])
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - this.getRequiredCommitmentCount() should return the correct value
     */
    it(`RWTRepo.getRequiredCommitmentCount should return R6[3], when R6[3] is
    less than (R6[1] * (len(R4) - 1) / 100 + R6[2])`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.box to be undefined
     * - check this.getRequiredCommitmentCount() to throw exception
     * @expected
     * - this.box should be undefined
     * - this.getRequiredCommitmentCount() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
     * @target should return a bigint with the value stored in R6[0] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock RWTRepo.explorerClient
     * - call this.updateBox
     * - check this.getCommitmentRwtCount() to return the correct value
     * @expected
     * - this.getCommitmentRwtCount() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[0] of this.box`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.box to be undefined
     * - check this.getCommitmentRwtCount() to throw exception
     * @expected
     * - this.box should be undefined
     * - this.getCommitmentRwtCount() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
     * @target should return index of watcher id in R4 register of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.getWidIndex() to return the correct index
     * @expected
     * - RWTRepo.getWidIndex() should return the correct index
     */
    it(`should return index of watcher id in R4 register of this.box`, async () => {
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
     * @target should return -1 if watcher id is not present in R4 register of
     * this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.getWidIndex() to return -1 for a non-existent watcher id
     * @expected
     * - this.getWidIndex() should return -1 for a non-existent watcher id
     */
    it(`should return -1 if watcher id is not present in R4 register of this.box`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.box to be undefined
     * - check this.getWidIndex() to throw exception
     * @expected
     * - this.getWidIndex() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
     * @target should return permitCount for a watcher id
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox
     * - check this.getPermitCount() to return correct value for permitCount
     * @expected
     * - RWTRepo.getPermitCount() should return correct value for permitCount
     */
    it(`should return permitCount for a watcher id`, async () => {
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
     * @target should return 0 for nonexistent watcher id
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox to update this.box
     * - check this.getPermitCount() to return 0 for a missing watcher id
     * @expected
     * - this.getPermitCount() should return 0 for a missing watcher id
     */
    it(`should return 0 for nonexistent watcher id`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.getPermitCount() to throw exception
     * @expected
     * - this.getPermitCount() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
     * @target should create and return an instance of RWTRepoBuilder using this
     * instance's properties
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.updateBox to update this.box
     * - check this.toBuilder() to return an instance of RWTRepoBuilder
     * - check this.toBuilder() to have created the RWTRepoBuilder instance with
     *   correct properties
     * @expected
     * - check this.toBuilder() should return an instance of RWTRepoBuilder
     * - check RWTRepo.toBuilder() should have created the RWTRepoBuilder
     *   instance with correct properties
     */
    it(`should create and return an instance of RWTRepoBuilder using this
    instance's properties`, async () => {
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
     * @target should throw an exception when this.box is undefined
     * @scenario
     * - create an instance of RWTRepo
     * - check this.toBuilder() to throw exception
     * @expected
     * - this.toBuilder() should throw exception
     */
    it(`should throw an exception when this.box is undefined`, async () => {
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
