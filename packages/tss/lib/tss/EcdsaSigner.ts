import { ECDSA } from '../enc';
import { EcdsaConfig } from '../types/signer';
import { TssSigner } from './TssSigner';

export class EcdsaSigner extends TssSigner {
  derivationPath: number[];

  constructor(config: EcdsaConfig) {
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
      signer: new ECDSA(config.secret),
    });
    this.derivationPath = config.derivationPath;
  }

  /**
   * gets extra data required in sign message
   * extra data:
   * - derivationPath
   * @returns
   */
  getSignExtraData = (): Record<string, any> => {
    return {
      derivationPath: this.derivationPath,
    };
  };
}
