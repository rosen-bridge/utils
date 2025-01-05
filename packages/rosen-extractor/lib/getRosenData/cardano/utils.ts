import { isArray, isString, isPlainObject } from 'lodash-es';
import {
  Int,
  JsonObject,
  List,
  ListObject,
  Map,
  MetadataObject,
  Metadatum,
  CString,
} from './types';

/**
 * Parse and validate Rosen data encoded in transaction metadata
 * @param data
 * @returns Rosen data or undefined if metadata is invalid
 */
export const parseRosenData = (data: any) => {
  if (
    data &&
    isPlainObject(data) &&
    isString(data.to) &&
    isString(data.networkFee) &&
    isString(data.bridgeFee) &&
    isString(data.toAddress) &&
    isArray(data.fromAddress) &&
    data.fromAddress.every(isString)
  ) {
    return {
      toChain: data.to,
      toAddress: data.toAddress,
      bridgeFee: data.bridgeFee,
      networkFee: data.networkFee,
      fromAddress: data.fromAddress.join(''),
    };
  }
  return undefined;
};

/**
 * extracts int value from Metadatum object
 * @param val
 * @returns : int value or undefined if parameter is not an int
 */
const getIntValue = (val: Metadatum) => {
  return Object.prototype.hasOwnProperty.call(val, 'int')
    ? (val as Int).int.toString()
    : undefined;
};

/**
 * extracts string value from Metadatum object
 * @param val
 * @returns : string value or undefined if parameter is not a string
 */
const getStringValue = (val: Metadatum) => {
  return Object.prototype.hasOwnProperty.call(val, 'string')
    ? (val as CString).string
    : undefined;
};

/**
 * extracts list value from Metadatum object
 * @param val
 * @returns : list value or undefined if parameter is not a list
 */
const getListValue = (val: Metadatum): ListObject | undefined => {
  if (Object.prototype.hasOwnProperty.call(val, 'list')) {
    const list = (val as List).list;
    const res: ListObject = [];
    list.forEach((item) => {
      const val = ObjectToJson(item);
      if (val) {
        res.push(val);
      }
    });
    return res;
  }
  return undefined;
};

/**
 * extracts one of int or string from Metadatum object
 * @param val
 * @returns : native value or undefined if parameter is not a string or int
 */
const getNativeValue = (val: Metadatum) => {
  const intVal = getIntValue(val);
  if (intVal) return intVal;
  const stringVal = getStringValue(val);
  if (stringVal) return stringVal;
};

/**
 * extracts dictionary from Metadatum object
 * @param val
 * @returns : dictionary value or undefined if parameter is not a dict
 */
export const getDictValue = (val: Metadatum): MetadataObject => {
  if (Object.prototype.hasOwnProperty.call(val, 'map')) {
    const list = (val as Map).map;
    const res: JsonObject = {};
    list.forEach((item) => {
      const key = getNativeValue(item.k);
      if (key) {
        res[key] = ObjectToJson(item.v);
      }
    });
    return res;
  } else if (Object.prototype.hasOwnProperty.call(val, 'list')) {
    const list = (val as List).list;
    const res: ListObject = [];
    list.map((item) => {
      res.push(getDictValue(item));
    });
    return res;
  }
  return getNativeValue(val);
};

/**
 * Convert a Metadatum to a json
 * @param val
 */
const ObjectToJson = (val: Metadatum) => {
  const nativeValue = getNativeValue(val);
  if (nativeValue) return nativeValue;
  const listValue = getListValue(val);
  if (listValue) return listValue;
  return getDictValue(val);
};
