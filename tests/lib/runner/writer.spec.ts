import {describe, expect, it, vi} from 'vitest';

import {Runner, Writer} from '../../../src/lib/runner';

describe('lib/runner/Writer', () => {
  describe('with a runner that all commands are pending', () => {
    const stream = {write: vi.fn()} as any as NodeJS.WriteStream;
    const writer = new Writer(stream);

    const runner = new Runner([
      {title: 'Command 1', script: 'echo "Hello, World!"', state: 'pending'},
      {title: 'Command 2', script: 'echo "Goodbye, World!"', state: 'pending'},
    ]);

    writer.print(runner);

    it('prints the frist command to the console', () => {
      expect(stream.write).toHaveBeenCalledWith('⧗ Command 1\n');
    });

    it('prints the second command to the console', () => {
      expect(stream.write).toHaveBeenCalledWith('⧗ Command 2\n');
    });
  });
});
