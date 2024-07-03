import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractRosenDataExtractor, RosenData } from '../../../lib';
import { ERGO_CHAIN, ERGO_NATIVE_TOKEN } from '../../../lib/getRosenData/const';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export class TestRosenDataExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = ERGO_CHAIN;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
  }

  /**
   * extracts RosenData from given lock transaction in Esplora format
   * @param transaction the lock transaction in Esplora format
   */
  extractRawData = (transaction: string): RosenData | undefined => {
    return {
      toChain: 'cardano',
      toAddress: 'toAddress4',
      bridgeFee: '2500',
      networkFee: '100000',
      fromAddress: 'fromAddress',
      sourceChainTokenId: ERGO_NATIVE_TOKEN,
      amount: '123456789',
      targetChainTokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
      sourceTxId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
    };
  };
}
