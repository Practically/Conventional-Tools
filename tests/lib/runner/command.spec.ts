import {describe, expect, it} from 'vitest';

import {createCommand} from '../../../src/lib/runner/command';

describe('lib/runner/command', () => {
  describe('with a single line script', () => {
    const command = createCommand('echo "Hello, World!"');

    it('sets the command to a pending state by default', () => {
      expect(command.state).toBe('pending');
    });

    it('sets the script content to the command script', () => {
      expect(command.script).toBe('echo "Hello, World!"');
    });

    it('sets the command title to be the script script body when its a single line script', () => {
      expect(command.title).toBe('echo "Hello, World!"');
    });
  });

  describe('with a multi line script', () => {
    const command = createCommand(
      '# The command title\necho "Goodbye, World!"',
    );

    it('sets the command body to be the whole script', () => {
      expect(command.script).toBe(
        '# The command title\necho "Goodbye, World!"',
      );
    });

    it('sets the title to be the first line of the comment', () => {
      expect(command.title).toBe('The command title');
    });
  });

  describe('with an already created command passed in', () => {
    const command = createCommand({
      title: 'My Command',
      script: 'echo "Hello, World!"',
      state: 'pending',
    });

    it('keeps the title of the command the same', () => {
      expect(command.title).toBe('My Command');
    });

    it('keeps the command the same', () => {
      expect(command.script).toBe('echo "Hello, World!"');
    });

    it('keeps the state the same', () => {
      expect(command.state).toBe('pending');
    });
  });
});
