import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {expect, test} from '@oclif/test';

import * as git from '../lib/git';

const commits: string[] = [
    'feat(thing): add ting 1',
    'feat(thing): add ting 2',
    'feat(thing): add ting 3',
    'feat(thing): add ting 4',
    'feat(thing): add ting 5',
    'feat(thing): add ting 6',
    'feat(thing): add ting 7',
    'feat(thing): add ting 8',
    'feat(thing): add ting 9',
]


beforeEach(async function() {
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
            expect(changelog).to.match(/^## v0.0.1/);
            expect(changelog).to.match(/add ting 3/);
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
