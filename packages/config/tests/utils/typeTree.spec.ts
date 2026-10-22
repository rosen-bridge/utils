import { ANY_INDEX } from '../../lib/constants/index';
import { ObjectElement } from '../../lib/elements/types/objectElement';
import { RefElement } from '../../lib/elements/types/refElement';
import { expand, step, unwrap as unwrapType } from '../../lib/utils/typeTree';
import { parseDocument, unwrap } from '../testUtils';

const document = unwrap(
  parseDocument({
    definitions: {
      types: {
        point: { type: 'object', properties: { x: { type: 'number' } } },
        holder: {
          type: 'object',
          properties: {
            ref: { type: 'ref', ref: 'point' },
            list: { type: 'array', items: { type: 'string' } },
            either: {
              type: 'union',
              options: [
                { option: { type: 'ref', ref: 'point' } },
                {
                  option: {
                    type: 'union',
                    options: [
                      { option: { type: 'string' } },
                      { option: { type: 'boolean' } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
  }),
);
const root = unwrap(document.getType('point', [])) as ObjectElement;
const schema = unwrap(document.getType('holder', [])) as ObjectElement;

describe('typeTree', () => {
  describe('unwrap', () => {
    /**
     * @target unwrap should follow references to their type
     * @dependencies
     * - RefElement
     * @scenario
     * - unwrap the `ref` property, and an object
     * @expected
     * - the referenced object, and the object itself
     */
    it('should follow references to their type', () => {
      const ref = schema.property('ref') as RefElement;
      expect(unwrapType(ref)).toBe(ref.targetType);
      expect(unwrapType(root)).toBe(root);
    });
  });

  describe('expand', () => {
    /**
     * @target expand should list the options of nested unions
     * @dependencies
     * - UnionElement
     * @scenario
     * - expand the `either` union, and a scalar
     * @expected
     * - the object, string and boolean types, and the scalar alone
     */
    it('should list the options of nested unions', () => {
      expect(
        expand(schema.property('either')!).map((type) => type.kind),
      ).toEqual(['object', 'string', 'boolean']);
      const list = schema.property('list')!;
      expect(expand(list)).toEqual([list]);
    });
  });

  describe('step', () => {
    /**
     * @target step should go to a property or the items of an array
     * @dependencies
     * - ObjectElement, ArrayElement
     * @scenario
     * - step into a property, an index, any index, a name of an array and a
     *   missing property
     * @expected
     * - the property and items types, then undefined twice
     */
    it('should go to a property or the items of an array', () => {
      const list = schema.property('list')!;
      expect(step(schema, 'list')).toBe(list);
      expect(step(list, '3')?.kind).toEqual('string');
      expect(step(list, ANY_INDEX)?.kind).toEqual('string');
      expect(step(list, 'x')).toEqual(undefined);
      expect(step(schema, 'missing')).toEqual(undefined);
    });
  });
});
