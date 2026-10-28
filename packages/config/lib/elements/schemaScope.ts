import type { AbstractLogger } from '@rosen-bridge/abstract-logger';

import type { ElementsMap } from './elementsMap';

/**
 * What an element can reach of the document it belongs to. `SchemaDocument`
 * implements it; elements only know this interface (imported as a type), so
 * they cannot call the document's own members and do not import its class.
 */
export interface SchemaScope {
  /**
   * Parses the nodes of the document's elements into elements of the
   * classes they name (by their `type`, `kind` or key).
   */
  readonly elements: ElementsMap;

  /**
   * The logger of the document, used by its elements.
   */
  readonly logger: AbstractLogger;
}
