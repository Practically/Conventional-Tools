import git from './git';
import sapling from './sapling';

export interface SourceControlProvider {
  /**
   * Tests to see if the current provider is enabled and can be used.
   */
  isEnabled(): Promise<boolean>;
  /**
   * Gets current branch name for the repository. For git this will get the
   * current branch name, for sapling it will get the bookmark or null if you
   * are not currently on one.
   */
  getBranchName(): Promise<string | null>;
  /**
   * Get the current root directory of for the repository.
   */
  root(): Promise<string>;
  /**
   * Get the current commit message from the source provider.
   */
  getCurrentCommitMessage(): Promise<string | null>;
  /**
   * Get a list of commits from the source provider to lint.
   *
   * @param from A string representing the starting commit hash or reference to
   * begin retrieving commits from.
   * @param to A string representing the ending commit hash or reference to
   * stop retrieving commits from.
   */
  getCommits(from?: string, to?: string): Promise<string[]>;
}

const PROVIDERS = [git, sapling];

export async function getSourceControlProvider(): Promise<
  SourceControlProvider | undefined
> {
  for (const provider of PROVIDERS) {
    if (await provider.isEnabled()) {
      return provider;
    }
  }
}
