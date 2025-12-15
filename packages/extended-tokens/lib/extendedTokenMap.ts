import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import { parseTokenMapBoxes } from './parseTokenMapBoxes';

/**
 * An extension version of the TokenMap class that supports updating token map config directly by boxes
 */
export class ExtendedTokenMap extends TokenMap {
  constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * set tokens config by token map boxes
   * @param serializedBoxes list of sigma serialized bytes of token map config boxes
   */
  updateConfigByBoxes = async (serializedBoxes: string[]) => {
    const tokens = parseTokenMapBoxes(serializedBoxes);

    await this.updateConfigByJson(tokens);
  };
}
