import { TokenMap } from '@rosen-bridge/tokens';
import { RosenData } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { validateAddress } from '@rosen-bridge/address-codec';

export default abstract class AbstractRosenDataExtractor<TransactionType> {
  abstract readonly chain: string;

  constructor(
    protected readonly lockAddress: string,
    protected readonly tokens: TokenMap,
    protected readonly logger: AbstractLogger = new DummyLogger(),
    protected readonly storeRawData = true,
  ) {}

  /**
   * extracts RosenData from given lock transaction and wrap the amount
   */
  get = (transaction: TransactionType): RosenData | undefined => {
    const data = this.extractData(transaction);
    if (data) {
      try {
        validateAddress(data.toChain, data.toAddress);
      } catch (e) {
        this.logger.debug(
          `Receiver address validation failed (address [${data.toAddress}] on chain [${data.toChain}]) with error: ${e}`,
        );
        return undefined;
      }
      data.amount = this.tokens
        .wrapAmount(data.sourceChainTokenId, BigInt(data.amount), this.chain)
        .amount.toString();
      // Conditionally set rawData based on storeRawData flag
      if (!this.storeRawData) {
        data.rawData = 'raw-data extraction is off';
      }
    }
    return data;
  };

  /**
   * extracts RosenData from given lock transaction
   */
  abstract extractData: (transaction: TransactionType) => RosenData | undefined;
}
