import { AbstractLogger } from './abstractLogger';

/**
 * Represents the available log levels, derived from AbstractLogger method names.
 * Excludes 'child' as it's not a logging level.
 */
export type LogLevel = Exclude<keyof AbstractLogger, 'child'>;
