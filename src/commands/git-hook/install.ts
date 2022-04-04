import {Command} from '@oclif/core';
import * as fs from 'fs';

const buildHook = ({hook}: {hook: string}) => `#!/bin/sh
#
# This hook was installed by conventional-tools
#
# You can uninstall all hook by running "conventional-tools git-hook:uninstall"
#

conventional-tools git-hook ${hook} "$@";
exit $?;
`;

const hooks = [
    'applypatch-msg',
    'commit-msg',
    'post-update',
    'pre-applypatch',
    'pre-commit',
    'pre-push',
    'pre-rebase',
    'pre-receive',
    'prepare-commit-msg',
    'update',
];

export default class HookInstall extends Command {
    static description =
        'Install the conventional-tools script into your .git/hooks directory';

    async run() {
        for (const hook of hooks) {
            fs.writeFileSync(`.git/hooks/${hook}`, buildHook({hook}), {
                mode: '775',
            });
        }
    }
}
