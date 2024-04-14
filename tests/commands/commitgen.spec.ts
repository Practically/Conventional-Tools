import {beforeEach, describe, expect, it, vi} from 'vitest';

import {handler} from '../../src/commands/commitgen';
import * as config from '../../src/lib/config';
import * as logger from '../../src/lib/logger';
import * as sourceControl from '../../src/lib/source-control';

declare module 'vitest' {
  export interface TestContext {
    commandResult?: number;
  }
}

// prettier-ignore
const TYPES = [
    'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'improvement', 'perf',
    'refactor', 'revert', 'style', 'test'
];

describe('command/commitgen', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'log').mockImplementation(() => {});
  });

  describe.each(TYPES)('with a %s branch name', type => {
    beforeEach(async ctx => {
      vi.spyOn(sourceControl, 'getSourceControlProvider').mockImplementation(
        async () => ({
          isEnabled: async () => true,
          getBranchName: async () => `${type}/123`,
          root: async () => '/',
        }),
      );

      ctx.commandResult = await handler();
    });

    it('exits with a success status code', ctx => {
      expect(ctx.commandResult).toBe(0);
    });

    it('has the generated by text in the commit message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Generated commit message by conventional tools',
        ),
      );
    });

    it('has the correct commit type at the start of the message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${type}\\(edit\\): edit`)),
      );
    });

    it('puts the correct issue number in the commit message', () => {
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('#123'));
    });

    if (type === 'fix') {
      it('has the fix issue trailer in the commit message', () => {
        expect(logger.log).toHaveBeenCalledWith(
          expect.stringContaining('Fixes Issue: #123'),
        );
      });
    } else {
      it('has the ref trailer in the commit message', () => {
        expect(logger.log).toHaveBeenCalledWith(
          expect.stringContaining('Ref: #123'),
        );
      });
    }
  });

  describe('with a scopes in the config file', () => {
    beforeEach(async ctx => {
      vi.spyOn(config, 'configGet').mockReturnValue(['scope1', 'scope2']);

      vi.spyOn(sourceControl, 'getSourceControlProvider').mockImplementation(
        async () => ({
          isEnabled: async () => true,
          getBranchName: async () => `feat/123`,
          root: async () => '/',
        }),
      );

      ctx.commandResult = await handler();
    });

    it('has the scopes in the commit message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('#   scope1, scope2'),
      );
    });
  });
});
