import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import commitgen from './commands/commitgen';
import gitHook from './commands/git-hook';
import gitHookInstall from './commands/git-hook:install';

export async function run(args: string[]) {
  await yargs(hideBin(args))
    .command(
      'commitgen',
      'Commit message generator',
      commitgen.builder,
      commitgen.handler,
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
    .showHelpOnFail(false)
    .strictOptions()
    .parse();
}
