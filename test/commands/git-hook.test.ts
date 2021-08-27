import * as fs from 'fs';
import {expect, test} from '@oclif/test';

import * as git from '../lib/git';

describe('git-hook:install', () => {
    test.do(async () => {
        await git.commit('Initial commit');
    })
        .stdout()
        .command(['git-hook:install'])
        .it('installs the git hooks', async () => {
            const file = fs.readFileSync(
                process.cwd() + '/.git/hooks/applypatch-msg',
            );
            expect(file.toString()).to.contain(
                'This hook was installed by conventional-tools',
            );
            expect(file.toString()).to.contain(
                'conventional-tools git-hook applypatch-msg "$@";',
            );
        });
});

describe('git-hook', () => {
    test.do(async () => {
        await git.commit('Initial commit');
        fs.writeFileSync(
            process.cwd() + '/.ctrc.yml',
            `
hooks:
  commit-msg:
    - echo "This is a hook"
`,
        );
    })
        .command(['git-hook:install'])
        .it('run basic commit hook', async () => {
            const output = await git.commit('feat: this is a feature');
            expect(output.exitCode).to.eq(0);
            expect(output.stderr).to.contain('echo "This is a hook"');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        fs.writeFileSync(
            process.cwd() + '/.ctrc.yml',
            `
hooks:
  commit-msg:
    - echo "This is a hook" && exit 1;
`,
        );
    })
        .command(['git-hook:install'])
        .it('run hook that fails', async () => {
            try {
                await git.commit('feat: bad feature');
                expect(null).to.contain(
                    'This should always thrown an exception',
                );
            } catch (err: any) {
                expect(err.exitCode).to.eq(1);
                expect(err.stderr).to.contain('echo "This is a hook"');
                expect(err.stderr).to.contain('Hooks failed with the message');
            }
        });
});

describe('git-hook:uninstall', () => {
    test.stdout()
        .command(['git-hook:uninstall'])
        .it('un installs the git hooks', async () => {
            const file = fs.readFileSync(
                process.cwd() + '/.git/hooks/applypatch-msg',
            );
            expect(file.toString()).to.contain(
                'This hook was un installed by conventional-tools',
            );
            expect(file.toString()).to.contain(
                '#conventional-tools git-hook applypatch-msg;',
            );
        });
});
