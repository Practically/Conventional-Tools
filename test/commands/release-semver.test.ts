import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {expect, test} from '@oclif/test';
import * as sinon from 'sinon';
import * as git from '../lib/git';

const got = require('got');
const execa = require('../../src/lib/execa');

const mocks: any = {};

describe('release-calver', () => {
    beforeEach(async function () {
        const a = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-test-'));
        process.chdir(a);
        await git.init();

        mocks.got = sinon.stub(got, 'post').returns(true);
        mocks.execa = sinon.stub(execa, 'execa');

        mocks.execa
            .withArgs('secret-tool')
            .returns({stdout: 'pass'})
            .withArgs('git', ['push', 'origin', '--tags'])
            .withArgs('git', ['push', 'origin', '-o', 'ci.skip']);

        await git.commit('Initial commit');

        const commits = [
            'feat(core): commit one',
            'feat(core): commit two',
            'feat(core): commit three',
        ];

        fs.writeFileSync('myfile.txt', '');
        for (const commit of commits) {
            fs.appendFileSync('myfile.txt', commit);
            await git.add();
            await git.commit(commit);
        }

        fs.writeFileSync('CHANGELOG.md', '');
    });

    afterEach(async function () {
        mocks.execa.restore();
        mocks.got.restore();
    });

    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                    releaseScopes: ['live'],
                },
            }),
        );
    })
        .stdout()
        .command(['release-calver', '-s', 'live'])
        .it('Creates a release', async a => {
            const changelog = fs.readFileSync('CHANGELOG.md').toString();
            expect(changelog).to.match(/^# live@\d{4,}.\d{2,}.\d{2,}/);
        });

    let gotCalled = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                    releaseScopes: ['live'],
                },
            }),
        );

        const date = new Date()
            .toISOString()
            .replace(/T.*/, '')
            .replace(/-/g, '.');

        const encodedTag = encodeURIComponent(`live@${date}`);
        const apiProjectId = encodeURIComponent('test/project');

        mocks.got
            .withArgs(
                `https://gitlab.com/api/v4/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
            )
            .callsFake((_: string, options: any) => {
                expect(options.headers['PRIVATE-TOKEN']).to.eq('pass');
                expect(options.json.name).to.eq(`Release: live@${date}`);
                expect(options.json.tag_name).to.eq(`live@${date}`);
                gotCalled = true;
            });
    })
        .stdout()
        .command(['release-calver', '-s', 'live'])
        .it('Creates a release and calls gitlab', async ({error}) => {
            expect(error).to.eq(undefined);
            expect(gotCalled).to.eq(true);
        });

    let gotCalled1 = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                    host: 'test.example.com',
                    releaseScopes: ['live'],
                },
            }),
        );

        const date = new Date()
            .toISOString()
            .replace(/T.*/, '')
            .replace(/-/g, '.');

        const encodedTag = encodeURIComponent(`live@${date}`);
        const apiProjectId = encodeURIComponent('test/project');

        mocks.got
            .withArgs(
                `https://test.example.com/api/v4/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
            )
            .callsFake((_: string, options: any) => {
                expect(options.headers['PRIVATE-TOKEN']).to.eq('pass');
                expect(options.json.name).to.eq(`Release: live@${date}`);
                expect(options.json.tag_name).to.eq(`live@${date}`);
                gotCalled1 = true;
            });
    })
        .stdout()
        .command(['release-calver', '-s', 'live'])
        .it(
            'Creates a release and calls a self hosted gitlab instance',
            async ({error}) => {
                expect(error).to.eq(undefined);
                expect(gotCalled1).to.eq(true);
            },
        );

    let gotCalled3 = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                    provider: 'github',
                    releaseScopes: ['live'],
                },
            }),
        );

        const date = new Date()
            .toISOString()
            .replace(/T.*/, '')
            .replace(/-/g, '.');

        mocks.got
            .withArgs(`https://api.github.com/repos/test/project/releases`)
            .callsFake((_: string, options: any) => {
                expect(options.headers['Authorization']).to.eq('token pass');
                expect(options.json.name).to.eq(`Release: live@${date}`);
                expect(options.json.tag_name).to.eq(`live@${date}`);
                gotCalled3 = true;

                return {json: () => ({id: 100})};
            });
    })
        .stdout()
        .command(['release-calver', '-s', 'live'])
        .it('Creates a release on github', async ({error}) => {
            expect(error).to.eq(undefined);
            expect(gotCalled3).to.eq(true);
        });
});
