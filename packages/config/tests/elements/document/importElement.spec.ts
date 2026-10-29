import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseDocument, unwrap } from '../../testUtils';

describe('ImportElement', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'import-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /**
   * Writes a schema file to the test folder and returns its path.
   * @param name - the file name
   * @param content - the schema document
   */
  const schemaFile = (name: string, content: unknown): string => {
    const path = join(dir, name);
    writeFileSync(path, JSON.stringify(content));
    return path;
  };

  /**
   * The problems of a document read from `main.json` with `imports`.
   * @param imports - the imports node
   */
  const importErrors = (imports: unknown) => {
    const result = parseDocument({ imports }, schemaFile('main.json', {}));
    return result.ok ? [] : result.errors;
  };

  describe('parseNode', () => {
    /**
     * @target ImportElement.parseNode should import the definitions of a file
     * @dependencies
     * - a temporary schema file
     * @scenario
     * - import `common.json` as `common` and use its type
     * @expected
     * - the type is found as `common.port`
     */
    it('should import the definitions of a file', () => {
      schemaFile('common.json', {
        definitions: { types: { port: { type: 'number' } } },
        schema: { type: 'nope' },
      });
      const document = unwrap(
        parseDocument(
          { imports: [{ from: './common.json', as: 'common' }] },
          schemaFile('main.json', {}),
        ),
      );
      expect(unwrap(document.getType('common.port', [])).kind).toEqual(
        'number',
      );
    });

    /**
     * @target ImportElement.parseNode should check `as` and `from`
     * @dependencies
     * @scenario
     * - import with `as` starting with a digit and an empty `from`
     * @expected
     * - problems at `as` and `from`
     */
    it('should check `as` and `from`', () => {
      expect(
        importErrors([{ from: '', as: '1x' }]).map(({ path }) => path),
      ).toEqual(['imports.0.as', 'imports.0.from']);
    });
  });

  describe('locate', () => {
    /**
     * @target ImportElement.locate should reject URLs, absolute paths and
     * missing files
     * @dependencies
     * - a temporary folder
     * @scenario
     * - import a URL, an absolute path, a missing file and a missing package
     * @expected
     * - a problem at `from` each time
     */
    it('should reject URLs, absolute paths and missing files', () => {
      for (const from of [
        'https://x/a.json',
        join(dir, 'a.json'),
        './missing.json',
        'no-such-package/a.json',
      ])
        expect(
          importErrors([{ from, as: 'a' }]).map(({ path }) => path),
        ).toEqual(['imports.0.from']);
    });

    /**
     * @target ImportElement.locate should need a schema read from a file
     * @dependencies
     * @scenario
     * - import from a schema that has no file
     * @expected
     * - a problem at `from`
     */
    it('should need a schema read from a file', () => {
      const result = parseDocument({
        imports: [{ from: './a.json', as: 'a' }],
      });
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
        'imports.0.from',
      ]);
    });
  });

  describe('importFile', () => {
    /**
     * @target ImportElement.importFile should report cycles and invalid files
     * @dependencies
     * - temporary schema files
     * @scenario
     * - import a file that imports the importing file, a file that is a
     *   list and a file that is not valid JSON
     * @expected
     * - a problem at `from` for each
     */
    it('should report cycles and invalid files', () => {
      schemaFile('back.json', { imports: [{ from: './main.json', as: 'm' }] });
      schemaFile('list.json', []);
      writeFileSync(join(dir, 'bad.json'), '{');
      const errors = importErrors([
        { from: './back.json', as: 'back' },
        { from: './list.json', as: 'list' },
        { from: './bad.json', as: 'bad' },
      ]);
      expect(errors.map(({ path }) => path)).toContain('imports.1.from');
      expect(errors.map(({ path }) => path)).toContain('imports.2.from');
      expect(
        errors.some(({ message }) => message.includes('imports form a cycle')),
      ).toEqual(true);
    });
  });
});
