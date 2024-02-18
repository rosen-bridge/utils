import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../db/entities/TransactionEntity';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import {
  CallbackFunction,
  SigningStatus,
  TransactionStatus,
  TxOptions,
  UnregisteredChain,
  ValidatorFunction,
} from './types';
import { txOptionToClause } from './utils';
import { AbstractPotChainManager } from '../network/AbstractPotChainManager';

export class TxPot {
  protected static instance: TxPot;
  protected readonly txRepository: Repository<TransactionEntity>;
  protected chains = new Map<string, AbstractPotChainManager>();
  protected validators = new Map<string, Map<string, ValidatorFunction>>();
  protected txTypeCallbacks = new Map<
    string,
    Map<TransactionStatus, CallbackFunction>
  >();
  protected logger: AbstractLogger;

  protected constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.txRepository = dataSource.getRepository(TransactionEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('TxPot instantiated');
  }

  /**
   * initiates TxPot
   * @param dataSource typeorm data source
   * @param logger
   * @returns
   */
  public static setup = (
    dataSource: DataSource,
    logger?: AbstractLogger
  ): TxPot => {
    TxPot.instance = new TxPot(dataSource, logger);
    return TxPot.instance;
  };

  /**
   * returns TxPot instance (throws error if none exists)
   * @returns TxPot instance
   */
  public static getInstance = (): TxPot => {
    if (!TxPot.instance) throw Error(`TxPot instance doesn't exist`);
    return TxPot.instance;
  };

  /**
   * registers a chain to TxPot
   * @param chain
   * @param chainManager
   */
  registerChain = (
    chain: string,
    chainManager: AbstractPotChainManager
  ): void => {
    this.chains.set(chain, chainManager);
    this.logger.debug(
      `A TxPot chain manager is registered for chain [${chain}]`
    );
  };

  /**
   * registers a validator function
   * @param chain
   * @param txType
   * @param validator
   */
  registerValidator = (
    chain: string,
    txType: string,
    validator: ValidatorFunction
  ): void => {
    let chainValidators = this.validators.get(chain);
    if (!chainValidators) {
      chainValidators = new Map<string, ValidatorFunction>();
      this.validators.set(chain, chainValidators);
    }

    chainValidators.set(txType, validator);
    this.logger.debug(
      `A tx validator function is registered for chain [${chain}] and type [${txType}]`
    );
  };

  /**
   * registers a callback function
   *  the callback will be called when status of any transactions
   *  of given type changes to given status
   * @param txType
   * @param status
   * @param callback
   */
  registerCallback = (
    txType: string,
    status: TransactionStatus,
    callback: CallbackFunction
  ): void => {
    let typeCallbacks = this.txTypeCallbacks.get(txType);
    if (!typeCallbacks) {
      typeCallbacks = new Map<TransactionStatus, CallbackFunction>();
      this.txTypeCallbacks.set(txType, typeCallbacks);
    }

    typeCallbacks.set(status, callback);
    this.logger.debug(
      `A tx status callback function is registered for type [${txType}] and status [${status}]`
    );
  };

  /**
   * returns chain manager for given chain
   *  throws error if no manager is registered for it
   * @param chain
   */
  protected getChainManager = (chain: string): AbstractPotChainManager => {
    const manager = this.chains.get(chain);
    if (!manager)
      throw new UnregisteredChain(
        `No manager is registered for chain [${chain}]`
      );
    return manager;
  };

  /**
   * sets the tx as invalid if enough blocks is passed from last check
   * @param tx
   */
  protected setTransactionAsInvalid = async (
    tx: TransactionEntity
  ): Promise<void> => {
    const manager = this.getChainManager(tx.chain);

    const currentHeight = await manager.getHeight();
    const requiredConfirmation = manager.getTxRequiredConfirmation(tx.txType);

    if (currentHeight - tx.lastCheck >= requiredConfirmation) {
      await this.setTxStatus(tx, TransactionStatus.INVALID);
      this.logger.info(`Tx [${tx.txId}] is invalid`);
    } else {
      this.logger.info(
        `Tx [${
          tx.txId
        }] seems invalid. Waiting for enough confirmation of this proposition [${
          currentHeight - tx.lastCheck
        }/${requiredConfirmation}]`
      );
    }
  };

  /**
   * validates a transaction
   * returns true if no validator functions is set or tx is valid
   * otherwise handle the tx as invalid and returns false
   * @param tx
   */
  protected validateTx = async (tx: TransactionEntity): Promise<boolean> => {
    const validator = this.validators.get(tx.chain)?.get(tx.txType);
    if (validator === undefined) {
      // tx is valid since no validator is found
      this.logger.debug(
        `No validator function is found for chain [${tx.chain}] and type [${tx.txType}]`
      );
      return true;
    }
    if (await validator(tx)) return true;

    await this.setTransactionAsInvalid(tx);
    return false;
  };

  /**
   * updates the status of a tx
   * @param txKey tx id and chain
   * @param status new status
   */
  protected setTxStatus = async (
    tx: TransactionEntity,
    status: TransactionStatus
  ): Promise<void> => {
    await this.txRepository.update(
      {
        txId: tx.txId,
        chain: tx.chain,
      },
      {
        status: status,
        lastStatusUpdate: this.currentTime(),
      }
    );
    const callback = this.txTypeCallbacks.get(tx.txType)?.get(status);
    if (callback)
      callback(tx, status).catch((e) => {
        this.logger.debug(
          `An error occurred while handling tx [${tx.txId}] status change: ${e}`
        );
        if (e instanceof Error && e.stack) this.logger.debug(e.stack);
      });
    else
      this.logger.debug(
        `No callback function is set for type [${tx.txType}] and status [${status}]`
      );
  };

  /**
   * @returns current timestamp in seconds and string format
   */
  protected currentTime = () => String(Math.round(Date.now() / 1000));

  /**
   * submits the signed transaction to the blockchain
   * @param tx
   */
  protected processSignedTx = async (tx: TransactionEntity): Promise<void> => {
    const manager = this.getChainManager(tx.chain);
    try {
      await manager.submitTransaction(tx.serializedTx);
    } catch (e) {
      this.logger.warn(
        `Failed to submit tx [${tx.txId}] to chain [${tx.chain}]: ${e}`
      );
      if (e instanceof Error && e.stack) this.logger.warn(e.stack);
    }
    await this.setTxStatus(tx, TransactionStatus.SENT);
  };

  /**
   * processes the sent transaction
   * @param tx
   */
  protected processesSentTx = async (tx: TransactionEntity): Promise<void> => {
    const manager = this.getChainManager(tx.chain);

    const txConfirmation = await manager.getTxConfirmation(tx.txId);
    const requiredConfirmation = manager.getTxRequiredConfirmation(tx.txType);

    if (txConfirmation >= requiredConfirmation) {
      // tx is confirmed enough
      await this.setTxStatus(tx, TransactionStatus.COMPLETED);
    } else if (txConfirmation === -1) {
      // tx is not mined, checking mempool...
      if (await manager.isTxInMempool(tx.txId)) {
        // tx is in mempool, updating last check...
        const height = await manager.getHeight();
        await this.updateTxLastCheck(tx.txId, tx.chain, height);
        this.logger.info(`Tx [${tx.txId}] is in mempool`);
      } else {
        // tx is not in mempool, checking if tx is still valid
        const isValidTx = await manager.isTxValid(
          tx.serializedTx,
          SigningStatus.Signed
        );
        const isValidToType = await this.validateTx(tx);

        if (isValidTx && isValidToType) {
          // tx is valid. resending...
          this.logger.info(`Tx [${tx.txId}] is still valid. Resending tx...`);
          await manager.submitTransaction(tx.serializedTx);
        } else {
          // tx seems invalid. reset status if enough blocks past.
          await this.setTransactionAsInvalid(tx);
        }
      }
    } else {
      // tx is mined, but is not confirmed enough, updating last check...
      const height = await manager.getHeight();
      await this.updateTxLastCheck(tx.txId, tx.chain, height);
      this.logger.info(
        `Tx [${tx.txId}] is in confirmation process [${txConfirmation}/${requiredConfirmation}]`
      );
    }
  };

  /**
   * runs all jobs of TxPot
   * - process signed txs
   * - process sent txs
   */
  update = async (): Promise<void> => {
    // process signed txs
    const signedTxs = await this.getTxsByStatus(TransactionStatus.SIGNED);
    for (const tx of signedTxs) {
      try {
        await this.processSignedTx(tx);
      } catch (e) {
        this.logger.warn(
          `An error occurred while processing tx [${tx.txId}] with status [${TransactionStatus.SIGNED}]: ${e}`
        );
        if (e instanceof Error && e.stack) this.logger.warn(e.stack);
      }
    }
    this.logger.debug(
      `Processed [${signedTxs.length}] txs with status [${TransactionStatus.SIGNED}]`
    );

    // process sent txs
    const sentTxs = await this.getTxsByStatus(TransactionStatus.SENT);
    for (const tx of sentTxs) {
      try {
        await this.processesSentTx(tx);
      } catch (e) {
        this.logger.warn(
          `An error occurred while processing tx [${tx.txId}] with status [${TransactionStatus.SENT}]: ${e}`
        );
        if (e instanceof Error && e.stack) this.logger.warn(e.stack);
      }
    }
    this.logger.debug(
      `Processed [${sentTxs.length}] txs with status [${TransactionStatus.SENT}]`
    );
  };

  /**
   * gets transactions by status
   * @param status
   * @param validate
   * @returns
   */
  getTxsByStatus = async (
    status: TransactionStatus,
    validate = false
  ): Promise<Array<TransactionEntity>> => {
    const txs = await this.txRepository.find({
      where: {
        status: status,
      },
    });
    if (!validate) return txs;

    // validate the transactions
    const validTxs: Array<TransactionEntity> = [];
    for (const tx of txs) {
      if (await this.validateTx(tx)) validTxs.push(tx);
    }
    return validTxs;
  };

  /**
   * inserts a new transaction into db
   * @param txId
   * @param chain
   * @param txType
   * @param requiredSign
   * @param serializedTx
   * @param initialStatus
   * @param lastCheck
   */
  addTx = async (
    txId: string,
    chain: string,
    txType: string,
    requiredSign: number,
    serializedTx: string,
    initialStatus = TransactionStatus.APPROVED,
    lastCheck = 0
  ): Promise<void> => {
    await this.txRepository.insert({
      txId: txId,
      chain: chain,
      txType: txType,
      status: initialStatus,
      requiredSign: requiredSign,
      lastCheck: lastCheck,
      lastStatusUpdate: this.currentTime(),
      failedInSign: false,
      signFailedCount: 0,
      serializedTx: serializedTx,
    });
  };

  /**
   * updates the status of a tx
   * @param txId
   * @param chain
   * @param status new status
   */
  setTxStatusById = async (
    txId: string,
    chain: string,
    status: TransactionStatus
  ): Promise<void> => {
    const tx = await this.txRepository.findOneOrFail({
      where: { txId, chain },
    });
    await this.setTxStatus(tx, status);
  };

  /**
   * updates tx info when failed in sign process
   * @param txId
   * @param chain
   */
  setTxAsSignFailed = async (txId: string, chain: string): Promise<void> => {
    await this.txRepository.update(
      {
        txId: txId,
        chain: chain,
        status: TransactionStatus.IN_SIGN,
      },
      {
        status: TransactionStatus.SIGN_FAILED,
        lastStatusUpdate: this.currentTime(),
        signFailedCount: () => '"signFailedCount" + 1',
        failedInSign: true,
      }
    );
  };

  /**
   * updates the tx and set status as signed
   * @param txId
   * @param chain
   * @param serializedTx
   * @param currentHeight current height of the blockchain
   * @param extra
   * @param extra2
   */
  setTxAsSigned = async (
    txId: string,
    chain: string,
    serializedTx: string,
    currentHeight: number,
    extra?: string,
    extra2?: string
  ): Promise<void> => {
    const updatedFields: Partial<TransactionEntity> = {
      serializedTx: serializedTx,
      status: TransactionStatus.SIGNED,
      lastStatusUpdate: this.currentTime(),
      lastCheck: currentHeight,
    };
    if (extra) updatedFields.extra = extra;
    if (extra2) updatedFields.extra2 = extra2;

    await this.txRepository.update({ txId, chain }, updatedFields);
  };

  /**
   * updates last check value of a tx
   * @param txId
   * @param chain
   * @param currentHeight current height of the blockchain
   */
  updateTxLastCheck = async (
    txId: string,
    chain: string,
    currentHeight: number
  ): Promise<void> => {
    await this.txRepository.update(
      { txId, chain },
      { lastCheck: currentHeight }
    );
  };

  /**
   * updates failedInSign field of a transaction to false
   * @param txId
   * @param chain
   */
  resetFailedInSign = async (txId: string, chain: string): Promise<void> => {
    await this.txRepository.update(
      { txId, chain },
      {
        failedInSign: false,
      }
    );
  };

  /**
   * updates requiredSign field of a transaction
   * @param txId
   * @param chain
   * @param requiredSign
   */
  updateRequiredSign = async (
    txId: string,
    chain: string,
    requiredSign: number
  ): Promise<void> => {
    await this.txRepository.update(
      { txId, chain },
      {
        requiredSign: requiredSign,
      }
    );
  };

  /**
   * gets the transaction by its id and chain
   * @param txId
   * @param chain
   */
  getTxByKey = async (
    txId: string,
    chain: string
  ): Promise<TransactionEntity | null> => {
    return await this.txRepository.findOne({
      where: { txId, chain },
    });
  };

  /**
   * @returns the transactions with valid status
   */
  getTxsQuery = (
    options: Array<TxOptions> = []
  ): Promise<TransactionEntity[]> => {
    return this.txRepository.find({
      where: options.map(txOptionToClause),
    });
  };
}