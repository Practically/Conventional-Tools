import {exec, type ExecException} from 'child_process';

interface ExecResult {
  code: number;
  stderr: string;
  stdout: string;
}

const getCode = (error: ExecException | null) => {
  if (!error) {
    return 0;
  }

  return error.code ?? 127;
};

export const run = (command: string) =>
  new Promise<ExecResult>(resolve => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        code: getCode(error),
        stderr,
        stdout,
      });
    });
  });

export default run;
