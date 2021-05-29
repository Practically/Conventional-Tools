import {expect, test} from '@oclif/test';

import * as git from '../lib/git';

describe('commitgen', () => {
    test.do(async () => {
        await git.commit('Initial commit');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen', async ctx => {
            expect(await git.getBranch()).to.eq('master');
            expect(ctx.stdout.trim()).to.match(/^#/);
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('feat/222');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen on a feature branch', async ctx => {
            expect(await git.getBranch()).to.eq('feat/222');
            expect(ctx.stdout).to.contain('feat(edit): edit');
            expect(ctx.stdout).to.contain('Ref: #222');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('fix/222');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen on a bug fix branch', async ctx => {
            expect(await git.getBranch()).to.eq('fix/222');
            expect(ctx.stdout).to.contain('fix(edit): edit');
            expect(ctx.stdout).to.contain('Fixes Issue: #222');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('fix/222');
    })
        .stdout()
        .command(['commitgen'])
        .it('runs commitgen on a bug fix branch', async ctx => {
            expect(await git.getBranch()).to.eq('fix/222');
            expect(ctx.stdout).to.contain('fix(edit): edit');
            expect(ctx.stdout).to.contain('Fixes Issue: #222');
        });

    test.do(async () => {
        await git.commit('Initial commit');
        await git.branch('fix/222-this-is-a-fix');
    })
        .stdout()
        .command(['commitgen'])
        .it(
            'runs commitgen on branch with a description in the name',
            async ctx => {
                expect(await git.getBranch()).to.eq('fix/222-this-is-a-fix');
                expect(ctx.stdout).to.contain('fix(edit): edit');
                expect(ctx.stdout).to.contain('Fixes Issue: #222');
                expect(ctx.stdout).to.not.contain(
                    'Fixes Issue: #222-this-is-a-fix',
                );
            },
        );
});
