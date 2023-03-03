import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { RosenData } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

export default abstract class AbstractRosenDataExtractor<TransactionType> {
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
   * extracts RosenData from given lock transaction
   */
  abstract get: (transaction: TransactionType) => RosenData | undefined;
}
