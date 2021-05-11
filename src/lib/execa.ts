/**
 * Execa shim so we can mock the default export.
 *
 * This exports all of execa so we can mock like so
 *
 * ```js
 * const mock = sinon.stub(execa, 'execa');
 * ```
 *
 * Without this package there is no way to mock the default export on a module
 * and testing becomes imposable.
 */
import * as execa from 'execa';

export {execa};
