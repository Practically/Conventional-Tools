import {expect, test} from '@oclif/test';
import * as fs from 'fs';
import * as execa from 'execa';

import * as git from '../lib/git';

describe('commitlint', () => {
    test.do(async () => {
        await git.commit('Initial commit');
        await git.commit('test: this is test commit');
    })
        .stdout()
        .command(['commitlint'])
        .exit(0)
        .it('runs commitlint', ctx => {
            expect(ctx.stdout).to.contain('test: this is test commit');
            expect(ctx.stdout).to.contain('references may not be empty');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.commit('no: this is bad');
    })
        .stderr()
        .stdout()
        .command(['commitlint'])
        .exit(2)
        .it('runs commitlint with bad commit', ctx => {
            expect(ctx.stderr).to.contain('Commitlint failed with errors');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        const root = await execa.command('git rev-parse --show-toplevel');
        fs.writeFileSync(
            `${root.stdout}/.git/COMMIT_EDITMSG`,
            `bad commit

# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# ------------------------ >8 ------------------------
# Do not modify or remove the line above.
# Everything below it will be ignored.
diff --git a/src/lib/gitlab-release.ts b/src/lib/gitlab-release.ts
index 7fee4b9..35e458f 100644
--- a/src/lib/gitlab-release.ts
+++ b/src/lib/gitlab-release.ts
`,
        );
    })
        .stderr()
        .stdout()
        .command(['commitlint'])
        .exit(2)
        .it('lints bad COMMIT_EDITMSG with scissors', ctx => {
            expect(ctx.stderr).to.contain('Commitlint failed with errors');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        const root = await execa.command('git rev-parse --show-toplevel');
        fs.writeFileSync(
            `${root.stdout}/.git/COMMIT_EDITMSG`,
            `bad commit

# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
`,
        );
    })
        .stderr()
        .stdout()
        .command(['commitlint'])
        .exit(2)
        .it('lints bad COMMIT_EDITMSG without scissors', ctx => {
            expect(ctx.stderr).to.contain('Commitlint failed with errors');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        const root = await execa.command('git rev-parse --show-toplevel');
        fs.writeFileSync(
            `${root.stdout}/.git/COMMIT_EDITMSG`,
            `chore: good commit

# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# ------------------------ >8 ------------------------
# Do not modify or remove the line above.
# Everything below it will be ignored.
diff --git a/src/lib/gitlab-release.ts b/src/lib/gitlab-release.ts
index 7fee4b9..35e458f 100644
--- a/src/lib/gitlab-release.ts
+++ b/src/lib/gitlab-release.ts
`,
        );
    })
        .stdout()
        .command(['commitlint'])
        .exit(0)
        .it('lints good COMMIT_EDITMSG with scissors', ctx => {
            expect(ctx.stdout).to.eq('');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        const root = await execa.command('git rev-parse --show-toplevel');
        fs.writeFileSync(
            `${root.stdout}/.git/COMMIT_EDITMSG`,
            `chore: good commit

# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
`,
        );
    })
        .stdout()
        .command(['commitlint'])
        .exit(0)
        .it('lints good COMMIT_EDITMSG without scissors', ctx => {
            expect(ctx.stdout).to.eq('');
        });
});
