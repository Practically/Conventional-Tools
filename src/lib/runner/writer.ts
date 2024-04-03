import type {Command} from './command';
import type {Runner} from './runner';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export class Writer {
  private frame = 0;

  constructor(private stream: NodeJS.WriteStream) {}

  public print(runner: Runner) {
    for (const command of runner) {
      this.stream.write(`${this.prefix(command)} ${command.title}\n`);
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
