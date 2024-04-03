import {spawn} from 'child_process';
import EventEmitter from 'events';

import {type Command, createCommand} from './command';

export class Runner {
  /**
   * A list of all the commands that need to be run by this runner
   */
  private commands: Command[] = [];

  /**
   * The event emitter that will handle the complete event that will get called
   * when a command has finished.
   */
  private eventEmitter = new EventEmitter();

  /**
   * Create the runner initializing all of the commands that need to be run
   */
  constructor(commands: (Command | string)[]) {
    this.commands = commands.map(createCommand);
  }

  /**
   * Returns the number of commands the runner is executing
   */
  get length() {
    return this.commands.length;
  }

  /**
   * Iterator implementation so we can loop over all of the commands in the
   * runner
   */
  *[Symbol.iterator]() {
    for (const command of this.commands) {
      yield command;
    }
  }

  /**
   * Start all of the commands
   */
  public start() {
    this.commands.forEach(this.runCommand.bind(this));
  }

  /**
   * Wait for all the commands to have exited. This will block until all of the
   * scripts have finished running
   */
  public wait() {
    return new Promise<void>(resolve => {
      if (this.isFinished()) {
        resolve();
      }

      this.eventEmitter.on('complete', () => {
        if (this.isFinished()) {
          resolve();
        }
      });
    });
  }

  /**
   * Helper function to test if all teh commands have finished running. A
   * command has finished when its status is either success or error.
   */
  public isFinished() {
    return !this.commands.some(command =>
      ['pending', 'running'].includes(command.state),
    );
  }

  /**
   * Run a command and emits the 'complete' event when the process has exited.
   * The command status will be updated before the event is fired. The status
   * will be determined by the exit code of the command.
   */
  private async runCommand(command: Command) {
    if (command.state !== 'pending') {
      return;
    }

    command.process = spawn('bash', ['-c', command.script], {
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    command.state = 'running';

    command.process.on('exit', code => {
      command.state = code === 0 ? 'success' : 'error';
      this.eventEmitter.emit('complete');
    });
  }
}
