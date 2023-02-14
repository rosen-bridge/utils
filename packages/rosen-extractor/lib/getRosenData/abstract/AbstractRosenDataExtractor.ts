import AbstractLogger from '../../logger/AbstractLogger';
import DummyLogger from '../../logger/DummyLogger';
import { RosenTokens, TokenMap } from '@rosen-bridge/tokens';
import { RosenData } from './types';

export default abstract class AbstractRosenDataExtractor {
  protected readonly logger: AbstractLogger;
  protected readonly tokens: TokenMap;
  protected readonly lockAddress: string;

  protected constructor(
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
  abstract get: (transaction: any) => RosenData | undefined;
}
