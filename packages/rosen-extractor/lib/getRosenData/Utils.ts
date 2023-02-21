import {
  Int,
  List,
  Metadatum,
  String as OgmiosString,
  Map,
} from '@cardano-ogmios/schema';
import { JsonObject, ListObject, MetadataObject } from './cardano/types';
import JSONBigInt from 'json-bigint';

class Utils {
  static JsonBI = JSONBigInt({
    useNativeBigInt: true,
    alwaysParseAsBig: true,
  });

  /**
   * extracts int value from Metadatum object
   * @param val
   * @returns : int value or undefined if parameter is not an int
   */
  static getIntValue = (val: Metadatum) => {
    return Object.prototype.hasOwnProperty.call(val, 'int')
      ? (val as Int).int.toString()
      : undefined;
  };

  /**
   * extracts string value from Metadatum object
   * @param val
   * @returns : string value or undefined if parameter is not a string
   */
  static getStringValue = (val: Metadatum) => {
    return Object.prototype.hasOwnProperty.call(val, 'string')
      ? (val as OgmiosString).string
      : undefined;
  };

  /**
   * extracts list value from Metadatum object
   * @param val
   * @returns : list value or undefined if parameter is not a list
   */
  static getListValue = (val: Metadatum): ListObject | undefined => {
    if (Object.prototype.hasOwnProperty.call(val, 'list')) {
      const list = (val as List).list;
      const res: ListObject = [];
      list.forEach((item) => {
        const val = this.ObjectToJson(item);
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
  static getNativeValue = (val: Metadatum) => {
    const intVal = this.getIntValue(val);
    if (intVal) return intVal;
    const stringVal = this.getStringValue(val);
    if (stringVal) return stringVal;
  };

  /**
   * extracts dictionary from Metadatum object
   * @param val
   * @returns : dictionary value or undefined if parameter is not a dict
   */
  static getDictValue = (val: Metadatum): MetadataObject => {
    if (Object.prototype.hasOwnProperty.call(val, 'map')) {
      const list = (val as Map).map;
      const res: JsonObject = {};
      list.forEach((item) => {
        const key = this.getNativeValue(item.k);
        if (key) {
          res[key] = this.ObjectToJson(item.v);
        }
      });
      return res;
    } else if (Object.prototype.hasOwnProperty.call(val, 'list')) {
      const list = (val as List).list;
      const res: ListObject = [];
      list.map((item) => {
        res.push(this.getDictValue(item));
      });
      return res;
    }
    return this.getNativeValue(val);
  };

  /**
   * Convert a Metadatum to a json
   * @param val
   */
  static ObjectToJson = (val: Metadatum) => {
    const nativeValue = this.getNativeValue(val);
    if (nativeValue) return nativeValue;
    const listValue = this.getListValue(val);
    if (listValue) return listValue;
    return this.getDictValue(val);
  };
}

export default Utils;
