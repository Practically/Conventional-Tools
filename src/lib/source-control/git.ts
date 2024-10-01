import {run} from '../exec';
import * as fs from 'fs';
import type {SourceControlProvider} from '.';

const git: SourceControlProvider = {
  isEnabled: async () => {
    const isGit = await run(`git rev-parse --is-inside-work-tree`);
    return isGit.code === 0;
  },

  getBranchName: async () => {
    const {stdout} = await run(`git rev-parse --abbrev-ref HEAD`);

    return stdout.trim();
  },

  root: async () => {
    const {stdout} = await run(`git rev-parse --show-toplevel`);
    return stdout.trim();
  },
  getCurrentCommitMessage: async () => {
    const root = await git.root();

    const commitEditMessagePath = `${root}/.git/COMMIT_EDITMSG`;

    if (fs.existsSync(commitEditMessagePath)) {
        const commitEditMessage = fs
            .readFileSync(commitEditMessagePath)
            .toString();

        const scissors = commitEditMessage.indexOf(
            '------------------------ >8 ------------------------',
        );

        const end = scissors > -1 ? scissors : commitEditMessage.length;
        const editMessage = commitEditMessage.substring(0, end).replace(/^#.*$/gm, '').trim();

        if (editMessage.length) {
            return editMessage;
        }
    }

    return null;
  },
  getCommits: async (from, to) => {
    const range = from && to ? `${from}..${to}` : '';
    const {stdout: commitsString} = await run(
      `git log ${range} --pretty=format:"%B%x00"`,
    );
    return commitsString.split('\0');
  },
};

export default git;
