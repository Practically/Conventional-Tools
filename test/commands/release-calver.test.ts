import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {expect, test} from '@oclif/test';
import * as sinon from 'sinon';
import * as git from '../lib/git';

const got = require('got');
const execa = require('../../src/lib/execa');

const mocks: any = {};

describe('release-semver', () => {
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
        await git.tag('v1.0.0');

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

    let gotCalled = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                },
            }),
        );

        const encodedTag = encodeURIComponent(`v1.1.0`);
        const apiProjectId = encodeURIComponent('test/project');

        mocks.got
            .withArgs(
                `https://gitlab.com/api/v4/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
            )
            .callsFake((_: string, options: any) => {
                expect(options.headers['PRIVATE-TOKEN']).to.eq('pass');
                expect(options.json.name).to.eq(`Release: v1.1.0`);
                expect(options.json.tag_name).to.eq(`v1.1.0`);
                gotCalled = true;
            });
    })
        .stdout()
        .command(['release-semver'])
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
                    host: 'git.example.com',
                },
            }),
        );

        const encodedTag = encodeURIComponent(`v1.1.0`);
        const apiProjectId = encodeURIComponent('test/project');

        mocks.got
            .withArgs(
                `https://git.example.com/api/v4/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
            )
            .callsFake((_: string, options: any) => {
                expect(options.headers['PRIVATE-TOKEN']).to.eq('pass');
                expect(options.json.name).to.eq(`Release: v1.1.0`);
                expect(options.json.tag_name).to.eq(`v1.1.0`);
                gotCalled1 = true;
            });
    })
        .stdout()
        .command(['release-semver'])
        .it(
            'Creates a release and calls custom gitlab domain',
            async ({error}) => {
                expect(error).to.eq(undefined);
                expect(gotCalled1).to.eq(true);
            },
        );

    let gotCalled2 = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    project: 'test/project',
                },
            }),
        );

        const encodedTag = encodeURIComponent(`v1.0.1-alpha.0`);
        const apiProjectId = encodeURIComponent('test/project');

        mocks.got
            .withArgs(
                `https://gitlab.com/api/v4/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
            )
            .callsFake((_: string, options: any) => {
                expect(options.headers['PRIVATE-TOKEN']).to.eq('pass');
                expect(options.json.name).to.eq(`Release: v1.0.1-alpha.0`);
                expect(options.json.tag_name).to.eq(`v1.0.1-alpha.0`);
                gotCalled2 = true;
            });
    })
        .stdout()
        .command(['release-semver', 'alpha'])
        .it('Creates a alpha release', async ({error}) => {
            expect(error).to.eq(undefined);
            expect(gotCalled2).to.eq(true);
        });

    let gotCalled3 = false;
    test.do(async () => {
        fs.writeFileSync(
            process.cwd() + '/.ctrc.json',
            JSON.stringify({
                git: {
                    provider: 'github',
                    project: 'test/project',
                },
            }),
        );

        const apiProjectId = 'test/project';
        mocks.got
            .withArgs(`https://api.github.com/repos/${apiProjectId}/releases`)
            .callsFake((_: string, options: any) => {
                expect(options.headers['Authorization']).to.eq('token pass');
                expect(options.json.name).to.eq(`Release: v1.0.1`);
                expect(options.json.tag_name).to.eq(`v1.0.1`);
                gotCalled3 = true;

                return {json: () => ({id: 100})};
            });
    })
        .stdout()
        .command(['release-semver', '1.0.1'])
        .it('Creates a github release', async ({error}) => {
            expect(error).to.eq(undefined);
            expect(gotCalled3).to.eq(true);
        });
});
