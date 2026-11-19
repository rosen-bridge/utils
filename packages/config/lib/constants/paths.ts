/**
 * The segment for any array item in a type's location (`nodes.*.url`) and in
 * paths built while resolving the schema. A written path never has an empty
 * segment, so it cannot be confused with a key.
 */
export const ANY_INDEX = '';

/**
 * How `ANY_INDEX` is shown in messages (`nodes.*.url`).
 */
export const ANY_INDEX_SHOWN = '*';

/**
 * The separator of the segments of a configuration path, and the mark of a
 * relative path when it starts one (`.tls`, `..mode`).
 */
export const PATH_SEPARATOR = '.';

/**
 * The separator of the words of an environment variable name
 * (`SERVER_TLS_KEY`).
 */
export const ENV_NAME_SEPARATOR = '_';

/**
 * The starts of an import's `from` that make it relative to the directory
 * of the importing schema file (`./common.json`, `../shared/types.yaml`).
 */
export const RELATIVE_IMPORT_PREFIXES = ['./', '../'];

/**
 * The separator of an import's name and a definition name in a reference to
 * an imported definition (`common.port`).
 */
export const NAMESPACE_SEPARATOR = '.';
