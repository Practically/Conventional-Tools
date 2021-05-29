import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {expect, test} from '@oclif/test';

import * as git from '../lib/git';

const commits: string[] = [
    'feat(thing): add ting 1',
    'feat(thing): add ting 2',
    'feat(thing): add ting 3',
    `fix(thing): thins is a braking change

BREAKING CHANGE: This is the description of the braking change`,
    `refactor(thing): this has a security notice

SECURITY: This is the description of the security notice`,
];

beforeEach(async function () {
    const a = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-test-'));
    process.chdir(a);
    await git.init();
});

describe('changelog', () => {
    test.do(async () => {
        fs.writeFileSync('myfile.txt', '');
        for (const commit of commits) {
            fs.appendFileSync('myfile.txt', commit);
            await git.add();
            await git.commit(commit);
        }

        fs.writeFileSync('CHANGELOG.md', '');
    })
        .command(['changelog', '0.0.1'])
        .it('creates a changelog', async () => {
            const changelog = fs.readFileSync('CHANGELOG.md').toString();

            /**
             * Assert the section headers
             */
            expect(changelog).to.match(/^## v0.0.1/);
            expect(changelog).to.match(/### Bug Fixes/);
            expect(changelog).to.match(/### Code Refactoring/);
            expect(changelog).to.match(/### Features/);
            expect(changelog).to.match(/### BREAKING CHANGES/);
            expect(changelog).to.match(/### SECURITY NOTICES/);

            /**
             * Assert a commit
             */
            expect(changelog).to.match(/\* \*\*thing:\*\* add ting 3/);

            /**
             * Assert the breaking change description gets added to the change log
             */
            expect(changelog).to.match(
                /\* \*\*thing:\*\* This is the description of the braking change/,
            );

            /**
             * Assert the security notice gets added to the change log
             */
            expect(changelog).to.match(
                /\* \*\*thing:\*\* This is the description of the security notice/,
            );
        });

    test.do(async () => {
        fs.writeFileSync('myfile.txt', '');
        for (const commit of commits) {
            fs.appendFileSync('myfile.txt', commit);
            await git.add();
            await git.commit(commit);
        }

        fs.mkdirSync('subdir');
        process.chdir('subdir');
        fs.writeFileSync('myfile.txt', '');
        fs.appendFileSync('myfile.txt', 'some text');
        await git.add();
        await git.commit('feat: add some text');

        fs.writeFileSync('CHANGELOG.md', '');
    })
        .command(['changelog', '0.0.1'])
        .it('creates a changelog of a directory', async () => {
            const changelog = fs.readFileSync('CHANGELOG.md').toString();
            expect(changelog).to.match(/^## v0.0.1/);
            expect(changelog).not.to.match(/add ting 3/);
            expect(changelog).to.match(/add some text/);
        });
});
