import { ECDSA } from '../enc';
import { EcdsaConfig, Sign } from '../types/signer';
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
      signer: new ECDSA(config.secret),
    });
    this.derivationPath = config.derivationPath;
  }

  /**
   * handles signing data callback in case of successful sign
   * @param sign
   * @param signature
   * @param signatureRecovery
   */
  handleSuccessfulSign = async (
    sign: Sign,
    signature?: string,
    signatureRecovery?: string
  ): Promise<void> => {
    if (signature && signatureRecovery) {
      sign.callback(true, undefined, signature, signatureRecovery);
    } else {
      throw Error(
        'signature and signature recovery are required when ECDSA sign is successful'
      );
    }
  };
}
