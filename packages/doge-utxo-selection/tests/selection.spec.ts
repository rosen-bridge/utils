import { DogeUtxo, selectDogeUtxos } from '../lib';
import * as testData from './testData';

describe('selectDogeUtxos', () => {
  const utxos = testData.utxos;
  const emptyTrackMap = testData.emptyMap;

  const createMockedGeneratorFunction = (boxes: Array<DogeUtxo>) =>
    boxes.values();

  /**
   * @target selectDogeUtxos should return enough boxes
   * as covered when boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required DOGE with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return first serialized box
   */
  it('should return enough boxes as covered when boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required DOGE with assets less than box assets
    const requiredDoge = 500000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      [],
      emptyTrackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[0]]);
  });

  /**
   * @target selectDogeUtxos should return all boxes as
   * NOT covered when boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required DOGE with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return both serialized boxes
   */
  it('should return all boxes as NOT covered when boxes do NOT cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required DOGE with assets more than box assets
    const requiredDoge = 30000000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      [],
      emptyTrackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(utxos.slice(0, 2));
  });

  /**
   * @target selectDogeUtxos should return enough boxes
   * as covered when tracked boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track first box to a new box
   * - mock required DOGE with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return serialized tracked box
   */
  it('should return enough boxes as covered when tracked boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, DogeUtxo>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);

    // Mock required DOGE with assets less than box assets
    const requiredDoge = 500000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      [],
      trackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[2]]);
  });

  /**
   * @target selectDogeUtxos should return second box
   * as covered when first box is not allowed
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock first box as forbidden
   * - mock required DOGE with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return second serialized box
   */
  it('should return second box as covered when first box is not allowed', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock first box as forbidden
    const forbiddenIds = [`${utxos[0].txId}.${utxos[0].index}`];

    // Mock required DOGE with assets less than box assets
    const requiredDoge = 900000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      forbiddenIds,
      emptyTrackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[1]]);
  });

  /**
   * @target selectDogeUtxos should return no boxes as
   * NOT covered when tracking ends to no box
   * @dependencies
   * @scenario
   * - mock a function to return one box
   * - mock a Map to track first box to no box
   * - mock required DOGE with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return empty list
   */
  it('should return no boxes as NOT covered when tracking ends to no box', async () => {
    // Mock a function to return one box
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 1));

    // Mock a Map to track first box to no box
    const trackMap = new Map<string, DogeUtxo | undefined>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, undefined);

    // Mock required DOGE with assets less than box assets
    const requiredDoge = 500000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      [],
      trackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target selectDogeUtxos should interact with AsyncIterator successfully
   * @dependencies
   * @scenario
   * - mock an async generator to return 12 utxos paginated
   * - mock required DOGE with assets less than total box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return all serialized boxes except the last one
   */
  it('should interact with AsyncIterator successfully', async () => {
    // Mock an async generator to return 12 utxos paginated
    const boxes = utxos.slice(0, 12);
    async function* generator() {
      let offset = 0;
      const limit = 2;
      while (true) {
        const page = boxes.slice(offset, offset + limit);
        if (page.length === 0) break;
        yield* page;
        offset += limit;
      }
      return undefined;
    }
    const nextUtxo = generator();

    // Mock required DOGE with assets less than box assets
    const requiredDoge = 90000000n;

    // Run test
    const result = await selectDogeUtxos(
      requiredDoge,
      [],
      emptyTrackMap,
      nextUtxo,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes.length).toBeGreaterThan(0);
  });
});
