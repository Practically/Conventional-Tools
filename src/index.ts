import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import commitgen from './commands/commitgen';

export async function run(args: string[]) {
  await yargs(hideBin(args))
    .command(
      'commitgen',
      'Commit message generator',
      commitgen.builder,
      commitgen.handler,
    )
    .strictOptions()
    .strict()
    .parse();
}
