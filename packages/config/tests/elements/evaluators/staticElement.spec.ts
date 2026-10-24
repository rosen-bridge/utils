import { step } from '../../../lib/utils/typeTree';
import { unwrap } from '../../testUtils';
import {
  evaluatorRoot,
  errorPaths,
  parseEvaluator,
  resolvedEvaluator,
} from './evaluatorsTestUtils';

const portType = step(evaluatorRoot, 'port')!;
const tlsType = step(evaluatorRoot, 'tls')!;

describe('StaticElement', () => {
  describe('parseNode', () => {
    /**
     * @target StaticElement.parseNode should read the value
     * @dependencies
     * @scenario
     * - parse `{ value: 1 }`
     * @expected
     * - a static evaluator with no type
     */
    it('should read the value', () => {
      const evaluator = unwrap(parseEvaluator({ value: 1 }));
      expect(evaluator.kind).toEqual('value');
      expect(evaluator.type).toEqual(undefined);
    });
  });

  describe('bind', () => {
    /**
     * @target StaticElement.bind should convert the value to the type
     * @dependencies
     * - NumberElement
     * @scenario
     * - bind `"8080"` to a number type and evaluate it
     * @expected
     * - the number 8080, always present
     */
    it('should convert the value to the type', () => {
      const evaluator = resolvedEvaluator({ value: '8080' });
      unwrap(evaluator.bind(portType));
      expect(evaluator.evaluate({}, [])).toEqual({
        present: true,
        value: 8080,
      });
    });

    /**
     * @target StaticElement.bind should fail for a value of another type or
     * a type that is not a scalar
     * @dependencies
     * - NumberElement, ObjectElement
     * @scenario
     * - bind `"x"` to a number type, then `1` to an object type
     * @expected
     * - a problem at `value` each time
     */
    it('should fail for a value of another type or a type that is not a scalar', () => {
      expect(
        errorPaths(resolvedEvaluator({ value: 'x' }).bind(portType)),
      ).toEqual(['e.value']);
      expect(errorPaths(resolvedEvaluator({ value: 1 }).bind(tlsType))).toEqual(
        ['e.value'],
      );
    });
  });

  describe('evaluate', () => {
    /**
     * @target StaticElement.evaluate should throw before it is bound
     * @dependencies
     * @scenario
     * - evaluate a static value that is not bound
     * @expected
     * - an error is thrown
     */
    it('should throw before it is bound', () => {
      expect(() => {
        resolvedEvaluator({ value: 1 }).evaluate({}, []);
      }).toThrow(Error);
    });
  });
});
