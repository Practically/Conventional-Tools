import fs from 'node:fs';

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {handler} from '../../src/commands/git-hook:install';
import git from '../../src/lib/source-control/git';

declare module 'vitest' {
  export interface TestContext {
    commandResult?: number;
    commandError?: unknown;
  }
}

describe('command/git-hook:install', () => {
  describe('with git disabled', () => {
    beforeEach(async ctx => {
      vi.spyOn(git, 'isEnabled').mockReturnValue(Promise.resolve(false));

      try {
        ctx.commandResult = await handler();
      } catch (error) {
        ctx.commandError = error;
      }
    });

    it('does not set the exit code because an error was thrown', ctx => {
      expect(ctx.commandResult).toBeUndefined();
    });

    it('throws and error because only git hooks can be installed with the git hooks command', ctx => {
      expect(ctx.commandError).toHaveProperty(
        'message',
        expect.stringMatching(/git is not enabled/i),
      );
    });
  });

  describe('with git enabled', () => {
    beforeEach(async ctx => {
      vi.spyOn(git, 'isEnabled').mockReturnValue(Promise.resolve(true));
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      ctx.commandResult = await handler();
    });

    // prettier-ignore
    const HOOKS = [
      'applypatch-msg', 'commit-msg', 'post-update', 'pre-applypatch',
      'pre-commit', 'pre-push', 'pre-rebase', 'pre-receive',
      'prepare-commit-msg', 'update',
    ];

    it.each(HOOKS)('writes the %s hook to the file system', hook => {
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `.git/hooks/${hook}`,
        expect.stringContaining('conventional-tools git-hook'),
        {mode: '775'},
      );
    });

    it('only writes the number of files that there are hooks', () => {
      expect(fs.writeFileSync).toHaveBeenCalledTimes(HOOKS.length);
    });
  });
});
