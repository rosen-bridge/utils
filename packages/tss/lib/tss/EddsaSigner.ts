import { EdDSA } from '../enc';
import { EddsaConfig } from '../types/signer';
import { TssSigner } from './TssSigner';

export class EddsaSigner extends TssSigner {
  derivationPath: number[];

  constructor(config: EddsaConfig) {
    super({
      logger: config.logger,
      guardsPk: config.guardsPk,
      submitMsg: config.submitMsg,
      messageValidDuration: config.messageValidDuration,
      timeoutSeconds: config.timeoutSeconds,
      tssApiUrl: config.tssApiUrl,
      callbackUrl: config.callbackUrl,
      detection: config.detection,
      turnDurationSeconds: config.turnDurationSeconds,
      turnNoWorkSeconds: config.turnNoWorkSeconds,
      getPeerId: config.getPeerId,
      shares: config.shares,
      thresholdTTL: config.thresholdTTL,
      responseDelay: config.responseDelay,
      signPerRoundLimit: config.signPerRoundLimit,
      chainCode: config.chainCode,
      signer: new EdDSA(config.secret),
    });
  }

  /**
   * gets extra data required in sign message
   * extra data: none
   * @returns
   */
  getSignExtraData = (): Record<string, any> => {
    return {};
  };
}
