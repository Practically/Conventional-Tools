import type {Command} from './command';
import type {Runner} from './runner';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export class Writer {
  private frame = 0;

  constructor(private stream: NodeJS.WriteStream) {}

  public writeLine(line: string | undefined) {
    if (!line) return;
    this.stream.write(`${line}\n`);
  }

  public print(runner: Runner) {
    for (const command of runner) {
      this.writeLine(`${this.prefix(command)} ${command.title}`);
    }

    this.frame = ++this.frame % FRAMES.length;
  }

  public update(runner: Runner) {
    this.stream.moveCursor(0, runner.length * -1);
    this.print(runner);
  }

  private prefix(command: Command) {
    if (command.state === 'pending') {
      return '⧗';
    }

    if (command.state === 'running') {
      return FRAMES[this.frame];
    }

    return command.state === 'success' ? '✔' : '✘';
  }
}
