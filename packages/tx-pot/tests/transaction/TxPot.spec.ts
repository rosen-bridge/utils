import { Repository } from 'typeorm';
import { mockDataSource } from '../db/dataSource.mock';
import {
  CallbackFunction,
  TransactionEntity,
  TransactionStatus,
  ValidatorFunction,
} from '../../lib';
import { TestTxPot } from './TestTxPot';
import * as testData from './testData';
import { TestPotChainManager } from '../network/TestPotChainManager';

describe('TxPot', () => {
  let txRepository: Repository<TransactionEntity>;
  let txPot: TestTxPot;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(testData.currentTimeStamp));
  });

  beforeEach(async () => {
    // init TxPot
    const dataSource = await mockDataSource();
    txPot = TestTxPot.setup(dataSource);
    txRepository = dataSource.getRepository(TransactionEntity);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('unregisterValidator', () => {
    /**
     * @target TxPot.unregisterValidator should remove registered validator successfully
     * @dependencies
     * @scenario
     * - register a validator function
     * - run test
     * - check registered validators
     * @expected
     * - there should be no validator
     */
    it('should remove registered validator successfully', async () => {
      const mockedValidator = async (tx: TransactionEntity) => true;
      txPot.registerValidator('chain', 'txType', 'id', mockedValidator);

      txPot.unregisterValidator('chain', 'txType', 'id');

      const validatorsMap: Map<
        string,
        Map<string, Map<string, ValidatorFunction>>
      > = (txPot as any).validators;
      expect(validatorsMap.get('chain')?.get('txType')?.size).toEqual(0);
    });
  });

  describe('unregisterSubmitValidator', () => {
    /**
     * @target TxPot.unregisterSubmitValidator should remove registered submit validator successfully
     * @dependencies
     * @scenario
     * - register a validator function
     * - run test
     * - check registered submit validators
     * @expected
     * - there should be no validator
     */
    it('should remove registered submit validator successfully', async () => {
      const mockedValidator = async (tx: TransactionEntity) => true;
      txPot.registerSubmitValidator('chain', 'id', mockedValidator);

      txPot.unregisterSubmitValidator('chain', 'id');

      const validatorsMap: Map<string, Map<string, ValidatorFunction>> = (
        txPot as any
      ).submissionAllowance;
      expect(validatorsMap.get('chain')?.size).toEqual(0);
    });
  });

  describe('unregisterCallback', () => {
    /**
     * @target TxPot.unregisterCallback should remove registered submit validator successfully
     * @dependencies
     * @scenario
     * - register a validator function
     * - run test
     * - check registered submit validators
     * @expected
     * - there should be no validator
     */
    it('should remove registered submit validator successfully', async () => {
      const mockedCallback = vi.fn();
      txPot.registerCallback(
        'txType',
        TransactionStatus.SIGNED,
        'id',
        mockedCallback
      );

      txPot.unregisterCallback('txType', TransactionStatus.SIGNED, 'id');

      const callbacksMap: Map<
        string,
        Map<TransactionStatus, Map<string, CallbackFunction>>
      > = (txPot as any).txTypeCallbacks;
      expect(
        callbacksMap.get('txType')?.get(TransactionStatus.SIGNED)?.size
      ).toEqual(0);
    });
  });

  describe('setTransactionAsInvalid', () => {
    /**
     * @target TxPot.setTransactionAsInvalid should update status when enough blocks is passed
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert tx
     * - mock PotChainManager and register to TxPot
     *   - mock `getHeight`
     *   - mock `getTxRequiredConfirmation` to return -1
     * - run test
     * - check db records
     * @expected
     * - columns of the tx should be updated
     *   - status should be updated to invalid
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     */
    it('should update status when enough blocks is passed', async () => {
      // insert tx
      await txRepository.insert(testData.tx1);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx1.chain, mockedManager);
      // mock `getHeight`
      const requiredConfirmation = 5;
      const currentHeight = testData.tx1.lastCheck + requiredConfirmation;
      vi.spyOn(mockedManager, 'getHeight').mockResolvedValue(currentHeight);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(
        requiredConfirmation
      );

      // run test
      await txPot.callSetTransactionAsInvalid(testData.tx1);

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx1.txId,
          TransactionStatus.INVALID,
          String(testData.currentTimeStampAsSeconds),
        ],
      ]);
    });

    /**
     * @target TxPot.setTransactionAsInvalid should NOT update when enough blocks is NOT passed
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert tx
     * - mock PotChainManager and register to TxPot
     *   - mock `getHeight`
     *   - mock `getTxRequiredConfirmation` to return -1
     * - run test
     * - check db records
     * @expected
     * - columns of the tx should remain unchanged
     */
    it('should NOT update when enough blocks is NOT passed', async () => {
      // insert tx
      await txRepository.insert(testData.tx1);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx1.chain, mockedManager);
      // mock `getHeight`
      const requiredConfirmation = 5;
      const currentHeight = testData.tx1.lastCheck + requiredConfirmation - 1;
      vi.spyOn(mockedManager, 'getHeight').mockResolvedValue(currentHeight);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(
        requiredConfirmation
      );

      // run test
      await txPot.callSetTransactionAsInvalid(testData.tx1);

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [testData.tx1.txId, testData.tx1.status, testData.tx1.lastStatusUpdate],
      ]);
    });
  });

  describe('validateTx', () => {
    /**
     * @target TxPot.validateTx should return true when no validator function is set
     * @dependencies
     * @scenario
     * - run test
     * - check returned value
     * @expected
     * - should return true
     */
    it('should return true when no validator function is set', async () => {
      const res = await txPot.callValidateTx(testData.tx1);
      expect(res).toEqual(true);
    });

    /**
     * @target TxPot.validateTx should return true when tx is valid
     * @dependencies
     * @scenario
     * - register a validator function to return true
     * - run test
     * - check returned value
     * @expected
     * - should return true
     */
    it('should return true when tx is valid', async () => {
      const mockedValidator = async (tx: TransactionEntity) => true;
      txPot.registerValidator(
        testData.tx1.chain,
        testData.tx1.txType,
        'id',
        mockedValidator
      );

      const res = await txPot.callValidateTx(testData.tx1);
      expect(res).toEqual(true);
    });

    /**
     * @target TxPot.validateTx should return false and set tx as invalid
     * @dependencies
     * - database
     * @scenario
     * - insert tx into db
     * - register a validator function to return false
     * - mock TxPot.setTransactionAsInvalid
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - should return false
     * - `setTransactionAsInvalid` should got called
     */
    it('should return false and set tx as invalid', async () => {
      await txRepository.insert(testData.tx1);

      const mockedValidator = async (tx: TransactionEntity) => false;
      txPot.registerValidator(
        testData.tx1.chain,
        testData.tx1.txType,
        'id',
        mockedValidator
      );

      const mockedSetTransactionAsInvalid = vi.fn();
      vi.spyOn(txPot as any, 'setTransactionAsInvalid').mockImplementation(
        mockedSetTransactionAsInvalid
      );

      const res = await txPot.callValidateTx(testData.tx1);
      expect(res).toEqual(false);
      expect(mockedSetTransactionAsInvalid).toHaveBeenCalled();
    });

    /**
     * @target TxPot.validateTx should return false and set tx as invalid
     * when at least one validator returns false
     * @dependencies
     * - database
     * @scenario
     * - insert tx into db
     * - register 3 validator functions (1st and 3rd ones returns true, 2nd one returns false)
     * - mock TxPot.setTransactionAsInvalid
     * - run test
     * - check returned value
     * - check if function got called
     * @expected
     * - should return false
     * - `setTransactionAsInvalid` should got called
     */
    it('should return false and set tx as invalid when at least one validator returns false', async () => {
      await txRepository.insert(testData.tx1);

      const mockedValidators = [
        { id: 'validator-1', validator: async (tx: TransactionEntity) => true },
        {
          id: 'validator-2',
          validator: async (tx: TransactionEntity) => false,
        },
        { id: 'validator-3', validator: async (tx: TransactionEntity) => true },
      ];
      mockedValidators.forEach((mockedValidator) =>
        txPot.registerValidator(
          testData.tx1.chain,
          testData.tx1.txType,
          mockedValidator.id,
          mockedValidator.validator
        )
      );

      const mockedSetTransactionAsInvalid = vi.fn();
      vi.spyOn(txPot as any, 'setTransactionAsInvalid').mockImplementation(
        mockedSetTransactionAsInvalid
      );

      const res = await txPot.callValidateTx(testData.tx1);
      expect(res).toEqual(false);
      expect(mockedSetTransactionAsInvalid).toHaveBeenCalled();
    });
  });

  describe('setTxStatus', () => {
    /**
     * @target TxPot.setTxStatus should update status and lastStatusUpdate successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - register a callback function
     * - run test
     * - check db records
     * @expected
     * - columns of target tx should be updated as expected
     *   - status should be updated to new status
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     * - columns of other txs should remain unchanged
     */
    it('should update status and lastStatusUpdate successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx5);

      const newStatus = TransactionStatus.IN_SIGN;
      await txPot.callSetTxStatus(testData.tx1, newStatus);

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx1.txId,
          newStatus,
          String(testData.currentTimeStampAsSeconds),
        ],
        [testData.tx5.txId, testData.tx5.status, testData.tx5.lastStatusUpdate],
      ]);
    });

    /**
     * @target TxPot.setTxStatus should also call tx status callback if is provided
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - register a callback function for new status
     * - run test
     * - check db records
     * - check if function got called
     * @expected
     * - columns of target tx should be updated as expected
     *   - status should be updated to new status
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     * - columns of other txs should remain unchanged
     * - mocked callback should got called
     */
    it('should also call tx status callback if is provided', async () => {
      // insert 2 txs
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx5);

      // register a callback function
      const newStatus = TransactionStatus.IN_SIGN;
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      txPot.registerCallback(
        testData.tx1.txType,
        newStatus,
        'id',
        mockedCallback
      );

      // run test
      await txPot.callSetTxStatus(testData.tx1, newStatus);

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx1.txId,
          newStatus,
          String(testData.currentTimeStampAsSeconds),
        ],
        [testData.tx5.txId, testData.tx5.status, testData.tx5.lastStatusUpdate],
      ]);

      // check if function got called
      expect(mockedCallback).toHaveBeenCalled();
    });
  });

  describe('processSignedTx', () => {
    /**
     * @target TxPot.processSignedTx should submit the tx and update the status
     * @dependencies
     * - database
     * @scenario
     * - insert tx with signed status
     * - mock PotChainManager and register to TxPot
     *   - mock `submitTransaction`
     * - run test (call `update`)
     * - check if function got called
     * - check db records
     * @expected
     * - `submitTransaction` should got called
     * - columns of the tx should be updated
     *   - status should be updated to sent
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     */
    it('should submit the tx and update the status', async () => {
      // insert tx with signed status
      await txRepository.insert(testData.tx4);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx4.chain, mockedManager);
      // mock `submitTransaction`
      const mockedSubmitTransaction = vi.fn();
      mockedSubmitTransaction.mockResolvedValue(undefined);
      vi.spyOn(mockedManager, 'submitTransaction').mockImplementation(
        mockedSubmitTransaction
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSubmitTransaction).toHaveBeenCalled();

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx4.txId,
          TransactionStatus.SENT,
          String(testData.currentTimeStampAsSeconds),
        ],
      ]);
    });

    /**
     * @target TxPot.processSignedTx should update the status regardless of submit response
     * @dependencies
     * - database
     * @scenario
     * - insert tx with signed status
     * - mock PotChainManager and register to TxPot
     *   - mock `submitTransaction` to throw error
     * - register submit validator function
     * - run test (call `update`)
     * - check if function got called
     * - check db records
     * @expected
     * - `submitTransaction` should got called
     * - columns of the tx should be updated
     *   - status should be updated to sent
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     */
    it('should update the status regardless of submit response', async () => {
      // insert tx with signed status
      await txRepository.insert(testData.tx4);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx4.chain, mockedManager);
      // mock `submitTransaction`
      const mockedSubmitTransaction = vi.fn();
      mockedSubmitTransaction.mockRejectedValue(
        Error(`TestError: submit failed`)
      );
      vi.spyOn(mockedManager, 'submitTransaction').mockImplementation(
        mockedSubmitTransaction
      );

      // register submit validator function
      txPot.registerSubmitValidator(
        testData.tx1.chain,
        'validator-1',
        async (tx: TransactionEntity) => true
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSubmitTransaction).toHaveBeenCalled();

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx4.txId,
          TransactionStatus.SENT,
          String(testData.currentTimeStampAsSeconds),
        ],
      ]);
    });

    /**
     * @target TxPot.processSignedTx should not submit the tx nor update the status
     * when at least one submit validator does not allow submission
     * @dependencies
     * - database
     * @scenario
     * - insert tx with signed status
     * - mock PotChainManager and register to TxPot
     *   - mock `submitTransaction`
     * - register 3 submit validator functions
     *   - 1st and 3rd ones returns true
     *   - 2nd one returns false
     * - run test (call `update`)
     * - check if function got called
     * - check db records
     * @expected
     * - `submitTransaction` should NOT got called
     * - columns of the tx should remain unchanged
     */
    it('should not submit the tx nor update the status when at least one submit validator does not allow submission', async () => {
      // insert tx with signed status
      await txRepository.insert(testData.tx4);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx4.chain, mockedManager);
      // mock `submitTransaction`
      const mockedSubmitTransaction = vi.fn();
      mockedSubmitTransaction.mockResolvedValue(undefined);
      vi.spyOn(mockedManager, 'submitTransaction').mockImplementation(
        mockedSubmitTransaction
      );

      // register 3 submit validator functions
      const mockedValidators = [
        { id: 'validator-1', validator: async (tx: TransactionEntity) => true },
        {
          id: 'validator-2',
          validator: async (tx: TransactionEntity) => false,
        },
        { id: 'validator-3', validator: async (tx: TransactionEntity) => true },
      ];
      mockedValidators.forEach((mockedValidator) =>
        txPot.registerSubmitValidator(
          testData.tx1.chain,
          mockedValidator.id,
          mockedValidator.validator
        )
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSubmitTransaction).not.toHaveBeenCalled();

      // check db records
      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [testData.tx4.txId, testData.tx4.status, testData.tx4.lastStatusUpdate],
      ]);
    });
  });

  describe('processesSentTx', () => {
    /**
     * @target TxPot.processesSentTx should update tx status to completed when
     * transaction is confirmed enough
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation`
     * - run test (call `update`)
     * - check db records
     * @expected
     * - columns of the tx should be updated
     *   - status should be updated to completed
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     */
    it('should update tx status to completed when transaction is confirmed enough', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(5);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(5);

      // run test
      await txPot.update();

      // check db records
      const txs = (await txRepository.find()).flatMap((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        testData.tx6.txId,
        TransactionStatus.COMPLETED,
        String(testData.currentTimeStampAsSeconds),
      ]);
    });

    /**
     * @target TxPot.processesSentTx should only update tx lastCheck when transaction
     * is NOT confirmed enough
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation`
     *   - mock `getHeight`
     * - run test (call `update`)
     * - check db records
     * @expected
     * - columns of the tx should be as expected
     *   - lastCheck should be updated to current height
     *   - status and lastStatusUpdate should remain unchanged
     */
    it('should only update tx lastCheck when transaction is NOT confirmed enough', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(5);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `getHeight`
      const mockedHeight = 100110;
      vi.spyOn(mockedManager, 'getHeight').mockResolvedValue(mockedHeight);

      // run test
      await txPot.update();

      // check db records
      const txs = (await txRepository.find()).flatMap((tx) => [
        tx.txId,
        tx.status,
        tx.lastCheck,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        testData.tx6.txId,
        testData.tx6.status,
        mockedHeight,
        testData.tx6.lastStatusUpdate,
      ]);
    });

    /**
     * @target TxPot.processesSentTx should update tx lastCheck when transaction
     * is found in mempool
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation` to return -1
     *   - mock `isTxInMempool` to return true
     *   - mock `getHeight`
     * - run test (call `update`)
     * - check db records
     * @expected
     * - columns of the tx should be as expected
     *   - lastCheck should be updated to current height
     *   - status and lastStatusUpdate should remain unchanged
     */
    it('should update tx lastCheck when transaction is found in mempool', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(-1);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `isTxInMempool`
      vi.spyOn(mockedManager, 'isTxInMempool').mockResolvedValue(true);
      // mock `getHeight`
      const mockedHeight = 100110;
      vi.spyOn(mockedManager, 'getHeight').mockResolvedValue(mockedHeight);

      // run test
      await txPot.update();

      // check db records
      const txs = (await txRepository.find()).flatMap((tx) => [
        tx.txId,
        tx.status,
        tx.lastCheck,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        testData.tx6.txId,
        testData.tx6.status,
        mockedHeight,
        testData.tx6.lastStatusUpdate,
      ]);
    });

    /**
     * @target TxPot.processesSentTx should resubmit if tx is not found but still valid
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation` to return -1
     *   - mock `isTxInMempool` to return false
     *   - mock `isTxValid` to return true
     *   - mock `submitTransaction`
     * - run test (call `update`)
     * - check if function got called
     * @expected
     * - `submitTransaction` should got called
     */
    it('should resubmit if tx is not found but still valid', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(-1);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `isTxInMempool`
      vi.spyOn(mockedManager, 'isTxInMempool').mockResolvedValue(false);
      // mock `isTxValid`
      vi.spyOn(mockedManager, 'isTxValid').mockResolvedValue(true);
      // mock `submitTransaction`
      const mockedSubmitTransaction = vi.fn();
      mockedSubmitTransaction.mockResolvedValue(undefined);
      vi.spyOn(mockedManager, 'submitTransaction').mockImplementation(
        mockedSubmitTransaction
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSubmitTransaction).toHaveBeenCalled();
    });

    /**
     * @target TxPot.processesSentTx should not resubmit if submit validator does not allow
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation` to return -1
     *   - mock `isTxInMempool` to return false
     *   - mock `isTxValid` to return true
     *   - mock `submitTransaction`
     * - register a submit validator function to return false
     * - run test (call `update`)
     * - check if function got called
     * @expected
     * - `submitTransaction` should NOT got called
     */
    it('should not resubmit if submit validator does not allow', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(-1);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `isTxInMempool`
      vi.spyOn(mockedManager, 'isTxInMempool').mockResolvedValue(false);
      // mock `isTxValid`
      vi.spyOn(mockedManager, 'isTxValid').mockResolvedValue(true);
      // mock `submitTransaction`
      const mockedSubmitTransaction = vi.fn();
      mockedSubmitTransaction.mockResolvedValue(undefined);
      vi.spyOn(mockedManager, 'submitTransaction').mockImplementation(
        mockedSubmitTransaction
      );

      // register a submit validator function to return false
      txPot.registerSubmitValidator(
        testData.tx6.chain,
        'validator-2',
        async (tx: TransactionEntity) => false
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSubmitTransaction).not.toHaveBeenCalled();
    });

    /**
     * @target TxPot.processesSentTx should set transaction as invalid if tx is not valid anymore
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation` to return -1
     *   - mock `isTxInMempool` to return false
     *   - mock `isTxValid` to return false
     *   - mock `getHeight`
     * - mock TxPot.setTransactionAsInvalid
     * - run test (call `update`)
     * - check if function got called
     * @expected
     * - `setTransactionAsInvalid` should got called
     */
    it('should set transaction as invalid if tx is not valid anymore', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(-1);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `isTxInMempool`
      vi.spyOn(mockedManager, 'isTxInMempool').mockResolvedValue(false);
      // mock `isTxValid`
      vi.spyOn(mockedManager, 'isTxValid').mockResolvedValue(false);

      // mock TxPot.setTransactionAsInvalid
      const mockedSetTransactionAsInvalid = vi.fn();
      vi.spyOn(txPot as any, 'setTransactionAsInvalid').mockImplementation(
        mockedSetTransactionAsInvalid
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSetTransactionAsInvalid).toHaveBeenCalled();
    });

    /**
     * @target TxPot.processesSentTx should set transaction as invalid when registered
     * validator recognizes the tx as invalid
     * @dependencies
     * - database
     * @scenario
     * - insert tx with sent status
     * - register a validator function to return false
     * - mock PotChainManager and register to TxPot
     *   - mock `getTxConfirmation`
     *   - mock `getTxRequiredConfirmation` to return -1
     *   - mock `isTxInMempool` to return false
     *   - mock `isTxValid` to return true
     *   - mock `getHeight`
     * - mock TxPot.setTransactionAsInvalid
     * - run test (call `update`)
     * - check if function got called
     * @expected
     * - `setTransactionAsInvalid` should got called
     */
    it('should set transaction as invalid when registered validator recognizes the tx as invalid', async () => {
      // insert tx with sent status
      await txRepository.insert(testData.tx6);

      // register a validator function
      const mockedValidator = async (tx: TransactionEntity) => false;
      txPot.registerValidator(
        testData.tx6.chain,
        testData.tx6.txType,
        'id',
        mockedValidator
      );

      // mock PotChainManager and register to TxPot
      const mockedManager = new TestPotChainManager();
      txPot.registerChain(testData.tx6.chain, mockedManager);
      // mock `getTxConfirmation`
      vi.spyOn(mockedManager, 'getTxConfirmation').mockResolvedValue(-1);
      // mock `getTxRequiredConfirmation`
      vi.spyOn(mockedManager, 'getTxRequiredConfirmation').mockReturnValue(10);
      // mock `isTxInMempool`
      vi.spyOn(mockedManager, 'isTxInMempool').mockResolvedValue(false);
      // mock `isTxValid`
      vi.spyOn(mockedManager, 'isTxValid').mockResolvedValue(true);

      // mock TxPot.setTransactionAsInvalid
      const mockedSetTransactionAsInvalid = vi.fn();
      vi.spyOn(txPot as any, 'setTransactionAsInvalid').mockImplementation(
        mockedSetTransactionAsInvalid
      );

      // run test
      await txPot.update();

      // check if function got called
      expect(mockedSetTransactionAsInvalid).toHaveBeenCalled();
    });
  });

  describe('getTxsByStatus', () => {
    /**
     * @target TxPot.getTxsByStatus should return txs filtered by status
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different status
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by status', async () => {
      await txRepository.insert(testData.tx1); // different status
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      const txs = await txPot.getTxsByStatus(
        testData.tx3.status as TransactionStatus
      );
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
      expect(txs[1].txId).toEqual(testData.tx5.txId);
    });

    /**
     * @target TxPot.getTxsByStatus should only return valid txs when
     * validate key is passed
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs with same status
     * - register a validator function
     *   - should return true for first tx
     *   - should return false for second tx
     * - mock TxPot.setTransactionAsInvalid
     * - run test
     * - check returned value
     * @expected
     * - should return the valid tx
     */
    it('should only return valid txs when validate key is passed', async () => {
      // insert 2 txs with same status
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      // register a validator function
      const mockedValidator = async (tx: TransactionEntity) => {
        if (tx.txId === testData.tx3.txId) return true;
        return false;
      };
      txPot.registerValidator(
        testData.tx3.chain,
        testData.tx3.txType,
        'tx3-validator',
        mockedValidator
      );
      txPot.registerValidator(
        testData.tx5.chain,
        testData.tx5.txType,
        'tx5-validator',
        mockedValidator
      );

      // mock TxPot.setTransactionAsInvalid
      vi.spyOn(txPot as any, 'setTransactionAsInvalid').mockResolvedValue(
        undefined
      );

      // run test
      const txs = await txPot.getTxsByStatus(
        testData.tx3.status as TransactionStatus,
        true
      );
      expect(txs.length).toEqual(1);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
    });
  });

  describe('addTx', () => {
    /**
     * @target TxPot.addTx should insert new tx successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - run test
     * - check db records
     * @expected
     * - new tx should be inserted
     */
    it('should insert new tx successfully', async () => {
      await txPot.addTx(
        testData.tx1.txId,
        testData.tx1.chain,
        testData.tx1.txType,
        testData.tx1.requiredSign,
        testData.tx1.serializedTx,
        testData.tx1.status as TransactionStatus,
        testData.tx1.lastCheck
      );

      const txs = await txRepository.find();
      expect(txs.length).toEqual(1);
      expect(txs[0]).toEqual({
        ...testData.tx1,
        lastStatusUpdate: String(testData.currentTimeStampAsSeconds),
        extra: null,
        extra2: null,
      });
    });

    /**
     * @target TxPot.addTx should insert new tx with extra fields successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - run test
     * - check db records
     * @expected
     * - new tx should be inserted
     */
    it('should insert new tx with extra fields successfully', async () => {
      await txPot.addTx(
        testData.tx3.txId,
        testData.tx3.chain,
        testData.tx3.txType,
        testData.tx3.requiredSign,
        testData.tx3.serializedTx,
        testData.tx3.status as TransactionStatus,
        testData.tx3.lastCheck,
        testData.tx3.extra,
        testData.tx3.extra2
      );

      const txs = await txRepository.find();
      expect(txs.length).toEqual(1);
      expect(txs[0]).toEqual({
        ...testData.tx3,
        failedInSign: false,
        signFailedCount: 0,
        lastStatusUpdate: String(testData.currentTimeStampAsSeconds),
        extra: testData.tx3.extra,
        extra2: null,
      });
    });
  });

  describe('setTxStatusById', () => {
    /**
     * @target TxPot.setTxStatusById should throw error when tx is not found
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - run test & expect exception thrown
     * @expected
     * - it should throw Error
     */
    it('should throw error when tx is not found', async () => {
      await expect(async () => {
        await txPot.setTxStatusById(
          testData.tx1.txId,
          testData.tx1.chain,
          TransactionStatus.IN_SIGN
        );
      }).rejects.toThrow(Error);
    });

    /**
     * @target TxPot.setTxStatusById should update status and lastStatusUpdate successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - columns of target tx should be updated
     *   - status should be updated to new status
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     * - columns of other txs should remain unchanged
     */
    it('should update status and lastStatusUpdate successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const newStatus = TransactionStatus.IN_SIGN;
      await txPot.setTxStatusById(
        testData.tx1.txId,
        testData.tx1.chain,
        newStatus
      );

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
      ]);
      expect(txs).toEqual([
        [
          testData.tx1.txId,
          newStatus,
          String(testData.currentTimeStampAsSeconds),
        ],
        [testData.tx2.txId, testData.tx2.status, testData.tx2.lastStatusUpdate],
      ]);
    });
  });

  describe('setTxAsSignFailed', () => {
    /**
     * @target TxPot.setTxAsSignFailed should set tx as sign-failed and update required fields successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - columns of target tx should be updated as expected
     *   - status should be sign-failed
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     *   - failedInSign should be true
     *   - signFailedCount should be incremented
     * - columns of other txs should remain unchanged
     */
    it('should set tx as sign-failed and update required fields successfully', async () => {
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      await txPot.setTxAsSignFailed(testData.tx5.txId, testData.tx5.chain);

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastStatusUpdate,
        tx.failedInSign,
        tx.signFailedCount,
      ]);
      expect(txs).toEqual([
        [
          testData.tx3.txId,
          testData.tx3.status,
          testData.tx3.lastStatusUpdate,
          testData.tx3.failedInSign,
          testData.tx3.signFailedCount,
        ],
        [
          testData.tx5.txId,
          TransactionStatus.SIGN_FAILED,
          String(testData.currentTimeStampAsSeconds),
          true,
          testData.tx5.signFailedCount + 1,
        ],
      ]);
    });
  });

  describe('setTxAsSigned', () => {
    /**
     * @target TxPot.setTxAsSigned should set tx as signed and update required fields successfully
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - columns of target tx should be updated as expected
     *   - status should be signed
     *   - lastCheck should be updated to currentHeight
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     *   - serializedTx should be updated
     * - columns of other txs should remain unchanged
     */
    it('should set tx as signed and update required fields successfully', async () => {
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      const currentHeight = testData.tx3.lastCheck + 10;
      const serializedSignedTx = 'serialized-signed-tx';
      await txPot.setTxAsSigned(
        testData.tx3.txId,
        testData.tx3.chain,
        serializedSignedTx,
        currentHeight
      );

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastCheck,
        tx.lastStatusUpdate,
        tx.serializedTx,
      ]);
      expect(txs).toEqual([
        [
          testData.tx3.txId,
          TransactionStatus.SIGNED,
          currentHeight,
          String(testData.currentTimeStampAsSeconds),
          serializedSignedTx,
        ],
        [
          testData.tx5.txId,
          testData.tx5.status,
          testData.tx5.lastCheck,
          testData.tx5.lastStatusUpdate,
          testData.tx5.serializedTx,
        ],
      ]);
    });

    /**
     * @target TxPot.setTxAsSigned should also update extra fields if are provided
     * @dependencies
     * - Date
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - columns of target tx should be updated as expected
     *   - status should be signed
     *   - lastCheck should be updated to currentHeight
     *   - lastStatusUpdate should be updated to currentTimeStamp in seconds
     *   - serializedTx should be updated
     *   - extra should be updated
     *   - extra2 should be updated
     * - columns of other txs should remain unchanged
     */
    it('should also update extra fields if are provided', async () => {
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      const currentHeight = testData.tx3.lastCheck + 10;
      const serializedSignedTx = 'serialized-signed-tx';
      const updatedExtra = 'updated-extra';
      const updatedExtra2 = 'updated-extra-2';
      await txPot.setTxAsSigned(
        testData.tx3.txId,
        testData.tx3.chain,
        serializedSignedTx,
        currentHeight,
        updatedExtra,
        updatedExtra2
      );

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.status,
        tx.lastCheck,
        tx.lastStatusUpdate,
        tx.serializedTx,
        tx.extra,
        tx.extra2,
      ]);
      expect(txs).toEqual([
        [
          testData.tx3.txId,
          TransactionStatus.SIGNED,
          currentHeight,
          String(testData.currentTimeStampAsSeconds),
          serializedSignedTx,
          updatedExtra,
          updatedExtra2,
        ],
        [
          testData.tx5.txId,
          testData.tx5.status,
          testData.tx5.lastCheck,
          testData.tx5.lastStatusUpdate,
          testData.tx5.serializedTx,
          testData.tx5.extra ?? null,
          testData.tx5.extra2 ?? null,
        ],
      ]);
    });
  });

  describe('updateTxLastCheck', () => {
    /**
     * @target TxPot.updateTxLastCheck should update lastCheck column successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - lastCheck of target tx should be updated
     * - lastCheck of other txs should remain unchanged
     */
    it('should update lastCheck column successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const updatedLastCheck = testData.tx1.lastCheck + 100;
      await txPot.updateTxLastCheck(
        testData.tx1.txId,
        testData.tx1.chain,
        updatedLastCheck
      );

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.lastCheck,
      ]);
      expect(txs).toEqual([
        [testData.tx1.txId, updatedLastCheck],
        [testData.tx2.txId, testData.tx2.lastCheck],
      ]);
    });
  });

  describe('resetFailedInSign', () => {
    /**
     * @target TxPot.resetFailedInSign should set failedInSign column to false successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs
     *   - 2 with failedInSign column as true
     *   - 1 with failedInSign column as false
     * - run test
     * - check db records
     * @expected
     * - failedInSign of target tx should be false
     * - failedInSign of other txs should remain unchanged
     */
    it('should set failedInSign column to false successfully', async () => {
      await txRepository.insert(testData.tx1); // failedInSign is false
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx4);

      await txPot.resetFailedInSign(testData.tx3.txId, testData.tx3.chain);

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.failedInSign,
      ]);
      expect(txs).toEqual([
        [testData.tx1.txId, testData.tx1.failedInSign],
        [testData.tx3.txId, false],
        [testData.tx4.txId, testData.tx4.failedInSign],
      ]);
    });
  });

  describe('updateRequiredSign', () => {
    /**
     * @target TxPot.updateRequiredSign should update requiredSign column successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - requiredSign of target tx should be updated
     * - requiredSign of other txs should remain unchanged
     */
    it('should update requiredSign column successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const updatedRequiredSign = testData.tx1.requiredSign + 2;
      await txPot.updateRequiredSign(
        testData.tx1.txId,
        testData.tx1.chain,
        updatedRequiredSign
      );

      const txs = (await txRepository.find()).map((tx) => [
        tx.txId,
        tx.requiredSign,
      ]);
      expect(txs).toEqual([
        [testData.tx1.txId, updatedRequiredSign],
        [testData.tx2.txId, testData.tx2.requiredSign],
      ]);
    });
  });

  describe('getTxByKey', () => {
    /**
     * @target TxPot.getTxByKey should return the tx successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check returned value
     * @expected
     * - should return the expected tx
     */
    it('should return the tx successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const tx = await txPot.getTxByKey(testData.tx1.txId, testData.tx1.chain);
      expect(tx?.txId).toEqual(testData.tx1.txId);
    });

    /**
     * @target TxPot.getTxByKey should return null when tx is not found
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check returned value
     * @expected
     * - should return null
     */
    it('should return null when tx is not found', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const tx = await txPot.getTxByKey(testData.tx3.txId, testData.tx3.chain);
      expect(tx).toBeNull();
    });
  });

  describe('getTxsQuery', () => {
    /**
     * @target TxPot.getTxsQuery should return all txs when no option is passed
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check returned value
     * @expected
     * - should return 2 txs
     */
    it('should return all txs when no option is passed', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const txs = await txPot.getTxsQuery();
      expect(txs.length).toEqual(2);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by txId
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs with different txIds
     * - run test
     * - check returned value
     * @expected
     * - should return filtered tx
     */
    it('should return txs filtered by txId', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);

      const txs = await txPot.getTxsQuery([{ txId: testData.tx1.txId }]);
      expect(txs.length).toEqual(1);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by list of txId
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different txIds
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by list of txId', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3); // txId not on the list

      const txs = await txPot.getTxsQuery([
        { txId: [testData.tx1.txId, testData.tx2.txId] },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx2.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by chain
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different chains
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by chain', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3); // different chain

      const txs = await txPot.getTxsQuery([{ chain: testData.tx1.chain }]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx2.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by txType
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different txTypes
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by txType', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx4); // different txType

      const txs = await txPot.getTxsQuery([{ txType: testData.tx1.txType }]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx3.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by status
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different status
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by status', async () => {
      await txRepository.insert(testData.tx1); // different status
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx5);

      const txs = await txPot.getTxsQuery([
        {
          status: {
            not: false,
            value: testData.tx3.status as TransactionStatus,
          },
        },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
      expect(txs[1].txId).toEqual(testData.tx5.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by list of statuses
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different status
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by list of statuses', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3); // status not on the list

      const txs = await txPot.getTxsQuery([
        {
          status: {
            not: false,
            value: [
              testData.tx1.status as TransactionStatus,
              testData.tx2.status as TransactionStatus,
            ],
          },
        },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx2.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs that their status are not
     * equal to given status
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different status
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs that their status are not equal to given status', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3);

      const txs = await txPot.getTxsQuery([
        {
          status: {
            not: true,
            value: testData.tx1.status as TransactionStatus,
          },
        },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx2.txId);
      expect(txs[1].txId).toEqual(testData.tx3.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs that their status are not
     * on given list of statuses
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different status
     * - run test
     * - check returned value
     * @expected
     * - should return filtered tx
     */
    it('should return txs that their status are not on given list of statuses', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3); // status not on the list

      const txs = await txPot.getTxsQuery([
        {
          status: {
            not: true,
            value: [
              testData.tx1.status as TransactionStatus,
              testData.tx2.status as TransactionStatus,
            ],
          },
        },
      ]);
      expect(txs.length).toEqual(1);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by failedInSign
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different failedInSign
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by failedInSign', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3); // different failedInSign

      const txs = await txPot.getTxsQuery([
        { failedInSign: testData.tx1.failedInSign },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx2.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by extra
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs with different extra
     * - run test
     * - check returned value
     * @expected
     * - should return filtered tx
     */
    it('should return txs filtered by extra', async () => {
      await txRepository.insert(testData.tx1); // different extra
      await txRepository.insert(testData.tx3);

      const txs = await txPot.getTxsQuery([{ extra: testData.tx3.extra }]);
      expect(txs.length).toEqual(1);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
    });

    /**
     * @target TxPot.getTxsQuery should return txs filtered by list of extra
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different list of extra
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should return txs filtered by list of extra', async () => {
      await txRepository.insert(testData.tx1); // extra not on the list
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx4);

      const txs = await txPot.getTxsQuery([
        { extra: [testData.tx3.extra!, testData.tx4.extra!] },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx3.txId);
      expect(txs[1].txId).toEqual(testData.tx4.txId);
    });

    /**
     * @target TxPot.getTxsQuery should combine two filter options successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 3 txs with different txIds and chains
     * - run test
     * - check returned value
     * @expected
     * - should return 2 filtered txs
     */
    it('should combine two filter options successfully', async () => {
      await txRepository.insert(testData.tx1);
      await txRepository.insert(testData.tx2);
      await txRepository.insert(testData.tx3);

      const txs = await txPot.getTxsQuery([
        { txId: testData.tx1.txId },
        { chain: testData.tx1.chain },
      ]);
      expect(txs.length).toEqual(2);
      expect(txs[0].txId).toEqual(testData.tx1.txId);
      expect(txs[1].txId).toEqual(testData.tx2.txId);
    });
  });

  describe('updateExtra', () => {
    /**
     * @target TxPot.updateExtra should update extra columns successfully
     * @dependencies
     * - database
     * @scenario
     * - insert 2 txs
     * - run test
     * - check db records
     * @expected
     * - extra of target tx should be updated
     * - extra of other txs should remain unchanged
     */
    it('should update extra columns successfully', async () => {
      await txRepository.insert(testData.tx3);
      await txRepository.insert(testData.tx4);

      const updatedExtra = 'new-extra';
      await txPot.updateExtra(
        testData.tx3.txId,
        testData.tx3.chain,
        updatedExtra
      );

      const txs = (await txRepository.find()).map((tx) => [tx.txId, tx.extra]);
      expect(txs).toEqual([
        [testData.tx3.txId, updatedExtra],
        [testData.tx4.txId, testData.tx4.extra],
      ]);
    });

    /**
     * @target TxPot.updateExtra should set null successfully
     * @dependencies
     * - database
     * @scenario
     * - insert a tx with extra
     * - run test
     * - check db records
     * @expected
     * - extra of target tx should be updated
     */
    it('should set null successfully', async () => {
      await txRepository.insert(testData.tx3);

      const updatedExtra = null;
      await txPot.updateExtra(
        testData.tx3.txId,
        testData.tx3.chain,
        updatedExtra
      );

      const txs = (await txRepository.find()).map((tx) => [tx.txId, tx.extra]);
      expect(txs).toEqual([[testData.tx3.txId, updatedExtra]]);
    });
  });
});
