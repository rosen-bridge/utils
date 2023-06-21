export abstract class EncryptionHandler {
  abstract sign: (message: string) => Promise<string>;

  abstract verify: (
    message: string,
    signature: string,
    signerPublicKey: string
  ) => Promise<boolean>;

  abstract getCrypto: () => string;

  abstract getPk: () => Promise<string>;
}
