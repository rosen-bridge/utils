import { ANY_INDEX, INDEX_PATTERN } from '../constants/index';
import { ArrayElement } from '../elements/types/arrayElement';
import { ObjectElement } from '../elements/types/objectElement';
import type { TypeElement } from '../elements/types/typeElement';
import { UnionElement } from '../elements/types/unionElement';

/**
 * The types a value of `type` can be read as: the options of a union
 * (through nested unions), or else the type itself.
 * @param type - the type to expand
 */
export const expand = (type: TypeElement): TypeElement[] =>
  type instanceof UnionElement ? type.optionTypes.flatMap(expand) : [type];

/**
 * The type at `segment` below `type`: a property of an object, or the items
 * of an array for an index (or any index).
 * @param type - an object or array type
 * @param segment - a property name or an index
 */
export const step = (
  type: TypeElement,
  segment: string,
): TypeElement | undefined =>
  type instanceof ObjectElement
    ? type.property(segment)
    : type instanceof ArrayElement &&
        (segment === ANY_INDEX || INDEX_PATTERN.test(segment))
      ? type.itemType
      : undefined;
