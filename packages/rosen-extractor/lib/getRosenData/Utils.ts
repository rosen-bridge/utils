import {
  Int,
  List,
  Metadatum,
  String as OgmiosString,
  Map,
} from '@cardano-ogmios/schema';
import { JsonObject, ListObject, MetadataObject } from './cardano/types';

// TODO: add doc string for functions (#18)
class Utils {
  static getObjectKeyAsStringOrUndefined = (
    val: JsonObject,
    key: string
  ): string | undefined => {
    if (Object.prototype.hasOwnProperty.call(val, key)) {
      const res = val[key];
      if (typeof res === 'string') return res;
    }
    return undefined;
  };

  static getIntValue = (val: Metadatum) => {
    return Object.prototype.hasOwnProperty.call(val, 'int')
      ? (val as Int).int.toString()
      : undefined;
  };

  static getStringValue = (val: Metadatum) => {
    return Object.prototype.hasOwnProperty.call(val, 'string')
      ? (val as OgmiosString).string
      : undefined;
  };

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

  static getNativeValue = (val: Metadatum) => {
    const intVal = this.getIntValue(val);
    if (intVal) return intVal;
    const stringVal = this.getStringValue(val);
    if (stringVal) return stringVal;
  };

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

  static ObjectToJson = (val: Metadatum) => {
    const nativeValue = this.getNativeValue(val);
    if (nativeValue) return nativeValue;
    const listValue = this.getListValue(val);
    if (listValue) return listValue;
    return this.getDictValue(val);
  };
}

export default Utils;
