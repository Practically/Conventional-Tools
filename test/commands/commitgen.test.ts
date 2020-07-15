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

describe('commitgen', () => {
    test.do(async () => {
        await git.commit('Initial commit');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen', ctx => {
            process.stdout.write(process.cwd());
            expect(ctx.stdout.trim()).to.match(/^#/);
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('feat/222');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen on a feature branch', ctx => {
            expect(ctx.stdout).to.contain('feat(edit): edit');
            expect(ctx.stdout).to.contain('Ref: #222');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('fix/222');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen on a bug fix branch', ctx => {
            expect(ctx.stdout).to.contain('fix(edit): edit');
            expect(ctx.stdout).to.contain('Fixes Issue: #222');
        });
});
