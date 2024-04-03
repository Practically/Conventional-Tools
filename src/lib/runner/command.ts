import type {ChildProcess} from 'child_process';

/**
 * The shape of an internal command.
 */
export interface Command {
  /**
   * The title of the command. This will be displayed in the terminal.
   */
  title: string;
  /**
   * The script that will run the command.
   */
  script: string;
  /**
   * The currently running process.
   */
  process?: ChildProcess;
  /**
   * The current state of the command.
   */
  state: 'pending' | 'running' | 'error' | 'success';
}

/**
 * Create a new command structure from a script string
 */
export function createCommand(script: string | Command): Command {
  if (typeof script !== 'string') {
    return script;
  }

  return {
    script,
    title: getTitle(script),
    state: 'pending',
  };
}

/**
 * Get the title of the script. This will be the first line of the script if
 * its multiline.
 */
export function getTitle(script: string) {
  return !script.includes('\n')
    ? script
    : script.split('\n')[0].replace(/^#\s+(.*)/, '$1');
}
