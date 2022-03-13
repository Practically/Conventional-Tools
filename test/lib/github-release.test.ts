import got from 'got';
import {expect, test} from '@oclif/test';
import {stub} from 'sinon';
import {githubRelease} from '../../src/lib/github-release';

const mocks: any = {};

describe('github-release', () => {
    beforeEach(async function () {
        mocks.got = stub(got, 'post');
    });

    afterEach(async function () {
        mocks.got.restore();
    });

    test.it('Creates a base release', async () => {
        let gotCalled = false;
        mocks.got
            .withArgs(`https://api.github.com/repos/test/project/releases`)
            .callsFake((_: string, options: any) => {
                expect(options.headers['Authorization']).to.eq('token pass');
                expect(options.json.name).to.eq(`Release: v0.0.1`);
                expect(options.json.tag_name).to.eq('v0.0.1');
                gotCalled = true;

                return {json: () => ({id: 100})};
            });

        githubRelease({
            tag: 'v0.0.1',
            notes: 'This is the release notes',
            host: 'api.github.com',
            project: 'test/project',
            secret: 'pass',
            assets: [],
        });

        expect(gotCalled).to.eq(true);
    });

    test.it('Creates a base release with assets', async () => {
        let gotCalled = false;
        mocks.got.onCall(0).callsFake((url: string, options: any) => {
            expect(url).to.eq(
                `https://api.github.com/repos/test/project/releases`,
            );
            expect(options.headers['Authorization']).to.eq('token pass');
            expect(options.json.name).to.eq(`Release: v0.0.1`);
            expect(options.json.tag_name).to.eq('v0.0.1');

            return {json: () => ({id: 100})};
        });

        mocks.got.onCall(1).callsFake((url: string, options: any) => {
            expect(url).to.eq(
                `https://uploads.github.com/repos/test/project/releases/100/assets?name=CHANGELOG.md`,
            );
            expect(options.headers['Authorization']).to.eq('token pass');
            gotCalled = true;
        });

        await githubRelease({
            tag: 'v0.0.1',
            notes: 'This is the release notes',
            host: 'api.github.com',
            project: 'test/project',
            secret: 'pass',
            assets: ['/tmp/CHANGELOG.md'],
        });

        expect(gotCalled).to.eq(true);
    });
});
