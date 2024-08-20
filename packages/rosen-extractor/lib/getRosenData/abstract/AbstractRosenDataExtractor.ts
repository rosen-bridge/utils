import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { RosenData } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { validateAddress } from '@rosen-bridge/address-codec';

export default abstract class AbstractRosenDataExtractor<TransactionType> {
  abstract readonly chain: string;
  protected readonly logger: AbstractLogger;
  protected readonly tokens: TokenMap;
  protected readonly lockAddress: string;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    this.lockAddress = lockAddress;
    this.tokens = new TokenMap(tokens);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * extracts RosenData from given lock transaction and wrap the amount
   */
  get = (transaction: TransactionType): RosenData | undefined => {
    const rawData = this.extractRawData(transaction);
    if (rawData) {
      try {
        validateAddress(rawData.toChain, rawData.toAddress);
      } catch (e) {
        this.logger.debug(
          `Receiver address validation failed (address [${rawData.toAddress}] on chain [${rawData.toChain}]) with error: ${e}`
        );
        return undefined;
      }
      rawData.amount = this.tokens
        .wrapAmount(
          rawData.sourceChainTokenId,
          BigInt(rawData.amount),
          this.chain
        )
        .amount.toString();
    }
    return rawData;
  };

  /**
   * extracts RosenData from given lock transaction
   */
  abstract extractRawData: (
    transaction: TransactionType
  ) => RosenData | undefined;
}
