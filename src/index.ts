import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import commitgen from './commands/commitgen';
import commitlint from './commands/commitlint';
import gitHook from './commands/git-hook';
import gitHookInstall from './commands/git-hook:install';
import root from './commands/root';

export async function run(args: string[]) {
  await yargs(hideBin(args))
    .command(
      'commitgen',
      'Commit message generator',
      commitgen.builder,
      commitgen.handler,
    )
    .command(
      'root',
      'Gets the root directory of the current repository',
      root.builder,
      root.handler,
    )
    .command(
      'git-hook',
      'Run the hooks for a given action',
      gitHook.builder,
      gitHook.handler,
    )
    .command(
      'git-hook:install',
      'Install git hooks',
      gitHookInstall.builder,
      gitHookInstall.handler,
    )
    .command(
      'commitlint',
      'Lint your commits against Conventional Commits',
      commitlint.builder,
      commitlint.handler,
    )
    .showHelpOnFail(false)
    .strictOptions()
    .parse();
}
