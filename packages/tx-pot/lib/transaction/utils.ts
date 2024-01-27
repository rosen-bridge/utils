import { In, Not } from 'typeorm';
import { TxOptions } from './types';

/**
 * converts options for fetching txs to typeorm clause
 * @param options
 * @returns
 */
export const txOptionToClause = (options: TxOptions) => {
  const clause: Record<string, any> = {};

  // add txId clause
  if (typeof options.txId === 'string') {
    clause.txId = options.txId;
  } else if (Array.isArray(options.txId)) {
    clause.txId = In(options.txId);
  }

  // add chain clause
  if (typeof options.chain === 'string') {
    clause.chain = options.chain;
  }

  // add txType clause
  if (typeof options.txType === 'string') {
    clause.txType = options.txType;
  }

  // add status clause
  if (options.status) {
    if (typeof options.status.value === 'string') {
      if (options.status.not) {
        clause.status = Not(options.status.value);
      } else {
        clause.status = options.status.value;
      }
    } else if (Array.isArray(options.status.value)) {
      if (options.status.not) {
        clause.status = Not(In(options.status.value));
      } else {
        clause.status = In(options.status.value);
      }
    }
  }

  // add failedInSign clause
  if (typeof options.failedInSign === 'boolean') {
    clause.failedInSign = options.failedInSign;
  }

  // add extra clause
  if (typeof options.extra === 'string') {
    clause.extra = options.extra;
  } else if (Array.isArray(options.extra)) {
    clause.extra = In(options.extra);
  }

  return clause;
};
