import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {configGet} from '../../src/lib/config';

function setupConfigFile(workingDir: string, content: string) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-test-'));
  fs.writeFileSync(`${tmpDir}/.ctrc.yml`, content);
  fs.mkdirSync(path.join(tmpDir, workingDir), {recursive: true});

  vi.spyOn(process, 'cwd').mockReturnValue(path.join(tmpDir, workingDir));
}

describe('lib/logger', () => {
  describe('with a config file in the current working directory', () => {
    beforeEach(() => {
      setupConfigFile('.', 'testing: my value');
    });

    it('gets an item out of the config', () => {
      expect(configGet('testing', 'default')).toBe('my value');
    });

    it('gets a default value out of the config', () => {
      expect(configGet('missing', 'default')).toBe('default');
    });
  });

  describe('with a config file in the parent directory', () => {
    beforeEach(() => {
      setupConfigFile('some/dir', 'testing: my value');
    });

    it('gets an item out of the config', () => {
      expect(configGet('testing', 'default')).toBe('my value');
    });

    it('gets a default value out of the config', () => {
      expect(configGet('missing', 'default')).toBe('default');
    });
  });

  describe('with no config file in the root', () => {
    beforeEach(() => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-test-'));
      vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    });

    it('returns the default value because no config file was found', () => {
      expect(configGet('testing', 'default')).toBe('default');
    });
  });

  describe('with a nested object in the config file', () => {
    beforeEach(() => {
      setupConfigFile('', 'testing:\n one: my value');
    });

    it('gets an item out of the config', () => {
      expect(configGet('testing.one', 'default')).toBe('my value');
    });

    it('returns the default value if we access a key that dose not exist', () => {
      expect(configGet('testing.two', 'default')).toBe('default');
    });

    it('returns the hole object if we access the parent key', () => {
      expect(configGet('testing', 'default')).toStrictEqual({one: 'my value'});
    });
  });

  describe('with a nested array in the config file', () => {
    beforeEach(() => {
      setupConfigFile('', 'testing:\n - my value');
    });

    it('gets the first array item out of the config', () => {
      expect(configGet('testing.0', 'default')).toBe('my value');
    });

    it('returns the default value for a index that dose not exist', () => {
      expect(configGet('testing.1', 'default')).toBe('default');
    });

    it('returns the whole array if we access the top level ket', () => {
      expect(configGet('testing', 'default')).toStrictEqual(['my value']);
    });
  });
});
