import { EdDSA } from '../enc';
import { EddsaConfig, Sign, SignResult } from '../types/signer';
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
      signer: new EdDSA(config.secret),
    });
  }

  /**
   * sign message and return promise
   * @param message
   * @param chainCode
   * @param derivationPath
   */
  signPromised = (
    message: string,
    chainCode: string,
    derivationPath?: number[]
  ): Promise<SignResult> => {
    return new Promise<SignResult>((resolve, reject) => {
      if (derivationPath)
        throw Error(`derivationPath is not supported in EdDSA signing`);
      this.sign(
        message,
        (status: boolean, message?: string, signature?: string) => {
          if (status && signature)
            resolve({
              signature: signature,
              signatureRecovery: undefined,
            });
          reject(message);
        },
        chainCode,
        derivationPath
      )
        .then(() => null)
        .catch((e) => reject(e));
    });
  };

  /**
   * handles signing data callback in case of successful sign
   * @param sign
   * @param signature
   * @param signatureRecovery
   */
  handleSuccessfulSign = async (
    sign: Sign,
    signature?: string
  ): Promise<void> => {
    if (signature) {
      sign.callback(true, undefined, signature);
    } else {
      throw Error('signature is required when EdDSA sign is successful');
    }
  };
}
