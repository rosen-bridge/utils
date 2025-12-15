import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import {
  configBoxes,
  missingHeaderFieldConfigBox,
  thirdTokenMap,
} from './testData';
import { CorruptedConfigError, ExtendedTokenMap } from '../lib';

describe('ExtendedTokenMap', () => {
  describe('updateConfigByBoxes', () => {
    /**
     * @target ExtendedTokenMap.updateConfigByBoxes should successfully extract config from given boxes
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test
     * - check returned value and callback
     * @expected
     * - it should return expected config
     * - mocked callback should got called
     */
    it('should successfully extract config from given boxes', async () => {
      const tokenMap = new ExtendedTokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = Object.values(configBoxes).map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await tokenMap.updateConfigByBoxes(serializedBoxes);
      const res = tokenMap.getConfig();
      expect(res).toEqual(thirdTokenMap);
      expect(mockedCallback).toHaveBeenCalled();
    });

    /**
     * @target ExtendedTokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when it fails to parse the config
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when it fails to parse the config', async () => {
      const tokenMap = new ExtendedTokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBox = Buffer.from(
        ErgoBox.from_json(missingHeaderFieldConfigBox).sigma_serialize_bytes(),
      ).toString('hex');

      await expect(async () => {
        await tokenMap.updateConfigByBoxes([serializedBox]);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });
  });
});
