import {run} from '../exec';
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
};

export default git;
