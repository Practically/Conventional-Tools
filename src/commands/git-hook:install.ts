import fs from 'node:fs';

import git from '../lib/source-control/git';

const HOOKS_VERSION = '1';

const buildHook = ({hook}: {hook: string}) => `#!/bin/sh
#
# This hook was installed by conventional-tools
#
# You can uninstall all hook by running "conventional-tools git-hook:uninstall"
#

export CONVENTIONAL_TOOLS="true"
export CONVENTIONAL_TOOLS_HOOKS_VERSION="${HOOKS_VERSION}"

conventional-tools git-hook ${hook} "$@";
exit $?;
`;

// prettier-ignore
const HOOKS = [
    'applypatch-msg', 'commit-msg', 'post-update', 'pre-applypatch',
    'pre-commit', 'pre-push', 'pre-rebase', 'pre-receive',
    'prepare-commit-msg', 'update',
];

export const builder = {} as const;

export async function handler(): Promise<number> {
  if (!(await git.isEnabled())) {
    throw new Error(
      'Git is not enabled, you must be using git to install hooks',
    );
  }

  for (const hook of HOOKS) {
    fs.writeFileSync(`.git/hooks/${hook}`, buildHook({hook}), {
      mode: '775',
    });
  }

  return 0;
}

export default {
  builder,
  handler: async () => {
    await handler();
  },
};
