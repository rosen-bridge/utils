import { DummyLogger } from '@rosen-bridge/abstract-logger';

import {
  EnvironmentNames,
  mergeVariables,
} from '../../lib/generators/environmentNames';

describe('EnvironmentNames', () => {
  describe('name', () => {
    /**
     * @target EnvironmentNames.name should join the prefix and the path
     * @dependencies
     * @scenario
     * - name `server.tls.key` with the prefix `test-app`
     * @expected
     * - `TEST_APP_SERVER_TLS_KEY`
     */
    it('should join the prefix and the path', () => {
      const names = new EnvironmentNames(false, 'test-app', new DummyLogger());
      expect(names.name(['server', 'tls', 'key'])).toEqual(
        'TEST_APP_SERVER_TLS_KEY',
      );
    });

    /**
     * @target EnvironmentNames.name should warn when two paths get one name
     * @dependencies
     * - logger.warn (spied)
     * @scenario
     * - name `apiToken` and `api-token`
     * @expected
     * - both named `API_TOKEN`, with one warning
     */
    it('should warn when two paths get one name', () => {
      const logger = new DummyLogger();
      const warn = vi.spyOn(logger, 'warn');
      const names = new EnvironmentNames(false, '', logger);

      expect(names.name(['apiToken'])).toEqual('API_TOKEN');
      expect(names.name(['api-token'])).toEqual('API_TOKEN');
      expect(names.name(['apiToken'])).toEqual('API_TOKEN');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    /**
     * @target EnvironmentNames.name should give no name to a path without
     * letters or digits
     * @dependencies
     * - logger.warn (spied)
     * @scenario
     * - name the path `--`
     * @expected
     * - undefined, with a warning
     */
    it('should give no name to a path without letters or digits', () => {
      const logger = new DummyLogger();
      const warn = vi.spyOn(logger, 'warn');

      expect(new EnvironmentNames(true, '', logger).name(['--'])).toEqual(
        undefined,
      );
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('mergeVariables', () => {
  /**
   * @target mergeVariables should merge the keys of every tree
   * @dependencies
   * @scenario
   * - merge two trees with a common nested key, and a missing variable
   * @expected
   * - the union of the keys, merged again below the common key
   */
  it('should merge the keys of every tree', () => {
    expect(
      mergeVariables([
        { host: 'HOST', tls: { key: 'TLS_KEY' } },
        undefined,
        { file: 'FILE', tls: { cert: 'TLS_CERT' } },
      ]),
    ).toEqual({
      host: 'HOST',
      tls: { key: 'TLS_KEY', cert: 'TLS_CERT' },
      file: 'FILE',
    });
  });

  /**
   * @target mergeVariables should prefer a tree over a variable name
   * @dependencies
   * @scenario
   * - merge a name and a tree, then names only, then nothing
   * @expected
   * - the tree, then the first name, then undefined
   */
  it('should prefer a tree over a variable name', () => {
    expect(mergeVariables(['PROXY', { url: 'PROXY_URL' }])).toEqual({
      url: 'PROXY_URL',
    });
    expect(mergeVariables(['A', 'B'])).toEqual('A');
    expect(mergeVariables([undefined])).toEqual(undefined);
  });
});
