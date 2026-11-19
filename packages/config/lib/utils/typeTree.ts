import { ANY_INDEX, INDEX_PATTERN } from '../constants/index';
import { ArrayElement } from '../elements/types/arrayElement';
import { ObjectElement } from '../elements/types/objectElement';
import { RefElement } from '../elements/types/refElement';
import type { TypeElement } from '../elements/types/typeElement';
import { UnionElement } from '../elements/types/unionElement';

/**
 * The type a reference points to, through any number of references.
 * @param type - a type, possibly a reference
 */
export const unwrap = (type: TypeElement): TypeElement =>
  type instanceof RefElement ? unwrap(type.targetType) : type;

/**
 * The types a value of `type` can be read as: the options of a union
 * (through nested unions and references), or else the type itself.
 * @param type - the type to expand
 */
export const expand = (type: TypeElement): TypeElement[] => {
  const target = unwrap(type);
  return target instanceof UnionElement
    ? target.optionTypes.flatMap(expand)
    : [target];
};

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
