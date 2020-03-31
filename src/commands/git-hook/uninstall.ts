import {Command} from '@oclif/command';
import * as fs from 'fs';

const buildHook = ({hook}: {hook: string}) => `#!/bin/sh
#
# This hook was un installed by conventional-tools
#
# To reinstall you can run "ct git-hook:install"
#

#conventional-tools git-hook ${hook};
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

export default class HookUninstall extends Command {
    static description = 'describe the command here';

    async run() {
        for (const hook of hooks) {
            fs.writeFile(
                `.git/hooks/${hook}`,
                buildHook({hook}),
                {
                    mode: '775',
                },
                () => {},
            );
        }
    }
}
