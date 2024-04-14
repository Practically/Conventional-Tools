import {run} from '../exec';
import type {SourceControlProvider} from '.';

const sapling: SourceControlProvider = {
  isEnabled: async () => {
    const isSapling = await run(`sl root`);
    return isSapling.code === 0;
  },

  getBranchName: async () => {
    const {stdout} = await run(`sl log -r '.' -T"{bookmarks}"`);
    if (!stdout.trim()) {
      return null;
    }

    return stdout.trim();
  },

  root: async () => {
    const {stdout} = await run(`sl root`);
    return stdout.trim();
  },
};

export default sapling;
