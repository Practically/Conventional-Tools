import {existsSync, readFileSync} from 'fs';
import {dirname, join} from 'path';
import {parse} from 'yaml';

/**
 * Get a value from an object using a path. The path is a dot-separated string.
 */
function getObjectItem<T>(obj: any, path: string, value: T): T {
  const arr = path.split('.');
  while (arr.length && obj) {
    const current = arr.shift();
    if (current === undefined) {
      break;
    }

    obj = obj[current];
  }

  return obj || value;
}

/**
 * Finds the closest config file in the directory tree. If no file is found then
 * it returns undefined.
 */
function getConfigFile(filePath: string) {
  if (existsSync(join(filePath, '.ctrc.yml'))) {
    return join(filePath, '.ctrc.yml');
  }

  if (filePath === '/') {
    return undefined;
  }

  return getConfigFile(dirname(filePath));
}

/**
 * Get a value from the config file. If the config file does not exist or the
 * value is not found then it returns the default value.
 */
export function configGet<T>(path: string, defaultValue: T): T {
  const configFilePath = getConfigFile(process.cwd());
  if (!configFilePath) {
    return defaultValue;
  }

  const parsed = parse(readFileSync(configFilePath, 'utf8'));
  return getObjectItem(parsed, path, defaultValue);
}
