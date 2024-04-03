import type {ArgumentsCamelCase, Argv, BuilderCallback} from 'yargs';

import {configGet} from '../lib/config';
import {Runner, Writer} from '../lib/runner';

export function builder<T>(argv: Argv<T>) {
  return argv.positional('hook', {type: 'string', required: true});
}

type CommandBuilderCallback<T> = BuilderCallback<
  T,
  ReturnType<typeof builder<T>>
>;

export async function handler<T>(
  args: ArgumentsCamelCase<CommandBuilderCallback<Argv<T>>>,
): Promise<number> {
  const [, hook] = args._;
  const hooks = configGet(`hooks.${hook}`, [] as string[]);

  const runner = new Runner(hooks);
  const writer = new Writer(process.stdout);

  runner.start();

  writer.print(runner);
  const ticker = setInterval(() => writer.update(runner), 80);
  await runner.wait();

  clearInterval(ticker);
  writer.print(runner);

  return 0;
}

export default {
  builder,
  handler: async (args: any) => {
    await handler(args);
  },
};
