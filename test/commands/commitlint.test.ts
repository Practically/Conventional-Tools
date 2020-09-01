import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {expect, test} from '@oclif/test';

import * as git from '../lib/git';

beforeEach(async function() {
    const a = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-test-'));

    process.chdir(a);
    await git.init();
});

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
});