import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

export class AddressManager {
  protected static instance: AddressManager;
  protected readonly logger: AbstractLogger;
  protected chainValidators: Record<string, (address: string) => void>;
  protected chainDecoders: Record<string, (encodedAddress: string) => string>;

  constructor(
    chainValidators: Record<string, (address: string) => void>,
    chainDecoders: Record<string, (encodedAddress: string) => string>,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    this.logger = logger;
    this.chainValidators = chainValidators;
    this.chainDecoders = chainDecoders;
  }

  /**
   * initiates AddressManager
   * @param chainValidators an object that specifies the address validator function for each chain
   * @param chainDecoders an object that specifies the address decoder function for each chain
   * @param logger
   * @returns
   */
  public static init = (
    chainValidators: Record<string, (address: string) => void>,
    chainDecoders: Record<string, (encodedAddress: string) => string>,
    logger?: AbstractLogger,
  ): AddressManager => {
    AddressManager.instance = new AddressManager(
      chainValidators,
      chainDecoders,
      logger,
    );
    return AddressManager.instance;
  };

  /**
   * returns AddressManager instance (throws error if none exists)
   * @returns AddressManager instance
   */
  public static getInstance = (): AddressManager => {
    if (!AddressManager.instance)
      throw Error(`AddressManager instance doesn't exist`);
    return AddressManager.instance;
  };

  /**
   * validates address of a chain
   * @param chain
   * @param address
   */
  validateAddress = (chain: string, address: string): void => {
    const validator = this.chainValidators[chain];
    if (validator) validator(address);
    else
      throw Error(
        `No address validator is set for chain [${chain}] in AddressManager`,
      );
  };

  /**
   * decodes address of a chain
   * @param chain
   * @param address
   */
  decodeAddress = (chain: string, address: string): string => {
    const decoder = this.chainDecoders[chain];
    if (decoder) return decoder(address);
    throw Error(
      `No address decoder is set for chain [${chain}] in AddressManager`,
    );
  };
}
