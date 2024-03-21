import git from './git';

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
}

const PROVIDERS = [git];

export async function getSourceControlProvider(): Promise<
  SourceControlProvider | undefined
> {
  for (const provider of PROVIDERS) {
    if (await provider.isEnabled()) {
      return provider;
    }
  }
}
