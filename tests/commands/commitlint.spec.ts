import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Arguments} from 'yargs';

import {handler} from '../../src/commands/commitlint';
import * as logger from '../../src/lib/logger';
import * as sourceControl from '../../src/lib/source-control';

declare module 'vitest' {
  export interface TestContext {
    commandResult?: number;
  }
}

describe('command/commitlint', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'log').mockImplementation(() => {});
  });

  describe('with all valid commit messages', () => {
    beforeEach(async ctx => {
      vi.spyOn(sourceControl, 'getSourceControlProvider').mockImplementation(
        async () => ({
          isEnabled: async () => true,
          getBranchName: async () => 'feat/123',
          root: async () => '/path/to/repo',
          getCurrentCommitMessage: async () => 'feat: create the thing',
          getCommits: async () => ['feat: correct', 'chore: another correct'],
        }),
      );

      ctx.commandResult = await handler({_: [2, '']} as Arguments<
        Record<string, never>
      >);
    });

    it('returns correct exit code', ctx => {
      expect(ctx.commandResult).toStrictEqual(0);
    });

    it('displays warnings', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('references may not be empty'),
      );
    });
  });

  describe('with level set to 1', () => {
    beforeEach(async ctx => {
      vi.spyOn(sourceControl, 'getSourceControlProvider').mockImplementation(
        async () => ({
          isEnabled: async () => true,
          getBranchName: async () => 'feat/123',
          root: async () => '/path/to/repo',
          getCurrentCommitMessage: async () => 'feat: create the thing',
          getCommits: async () => ['feat: correct', 'chore: another correct'],
        }),
      );

      ctx.commandResult = await handler({_: [1, '']} as Arguments<
        Record<string, never>
      >);
    });

    it('does not show warnings', () => {
      expect(logger.log).not.toHaveBeenCalledWith(
        expect.stringContaining('references may not be empty'),
      );
    });
  });

  describe('with invalid commit messages', () => {
    beforeEach(async ctx => {
      vi.spyOn(sourceControl, 'getSourceControlProvider').mockImplementation(
        async () => ({
          isEnabled: async () => true,
          getBranchName: async () => 'feat/123',
          root: async () => '/path/to/repo',
          getCurrentCommitMessage: async () => 'feat: create the thing',
          getCommits: async () => ['my first commit that is incorrect'],
        }),
      );

      ctx.commandResult = await handler({_: [2, '']} as Arguments<
        Record<string, never>
      >);
    });

    it('returns correct exit code', ctx => {
      expect(ctx.commandResult).toStrictEqual(2);
    });

    it('logs commit message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('my first commit that is incorrect'),
      );
    });

    it('logs invalid subject error message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('subject may not be empty'),
      );
    });

    it('logs invalid type error message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('type may not be empty'),
      );
    });

    it('logs invalid references warning message', () => {
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('references may not be empty'),
      );
    });
  });
});
