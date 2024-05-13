import type {Arguments, Argv} from 'yargs';

import {configGet} from '../lib/config';
import {handlerWrapper} from '../lib/handler-wrapper';
import {Runner, Writer} from '../lib/runner';

type Options = Record<string, never>;

export function builder(argv: Argv<Options>) {
  return argv
    .positional('hook', {type: 'string', required: true})
    .string('test');
}

export async function handler(args: Arguments<Options>): Promise<number> {
  const [, hook] = args._;
  const hooks = configGet(`hooks.${hook}`, [] as string[]);

  // Exit early if no hooks are defined
  if (!hooks.length) return 0;

  const runner = new Runner(hooks);
  const writer = new Writer(process.stdout);

  runner.start();

  process.stdout.isTTY
    ? await interactive(runner, writer)
    : await nonInteractive(runner, writer);

  let exitCode = 0;
  for (const command of runner) {
    if (command.state === 'success') {
      continue;
    }

    exitCode = 1;

    writer.writeLine('-'.repeat(process.stderr.getWindowSize()[0]));
    writer.writeLine(`Command failed: ${command.title}`);
    writer.writeLine('');
    writer.writeLine(command.stdout);
    writer.writeLine(command.stderr);
  }

  return exitCode;
}

async function interactive(runner: Runner, writer: Writer) {
  writer.print(runner);
  const ticker = setInterval(() => writer.update(runner), 80);

  await runner.wait();

  clearInterval(ticker);
  writer.update(runner);
}

async function nonInteractive(runner: Runner, writer: Writer) {
  writer.print(runner);
  await runner.wait();
}

export default {builder, handler: handlerWrapper(handler)};
