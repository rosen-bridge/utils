import type { AbstractLogger } from '@rosen-bridge/abstract-logger';

import type { ParseResult } from '../parsing/result.js';
import type { ElementsMap } from './elementsMap.js';
import type { RuleElement } from './rules/ruleElement.js';
import type { TypeElement } from './types/typeElement.js';

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

  /**
   * The type defined as `name` under `definitions.types`, parsed for a use at
   * `location`, or a failure when there is none.
   * @param name - the name of the definition (`<as>.<name>` when imported)
   * @param location - the configuration path of the use
   */
  getType: (
    name: string,
    location: readonly string[],
  ) => ParseResult<TypeElement>;

  /**
   * The rule defined as `name` under `definitions.rules`, parsed for a use on
   * a type of kind `target`, or a failure when there is none or it does not
   * list `target`.
   * @param name - the name of the definition (`<as>.<name>` when imported)
   * @param target - the kind of the type the rule is used on
   */
  getRule: (name: string, target: string) => ParseResult<RuleElement>;
}
