import {Command} from '@oclif/command';

import * as conventionalRecommendedBump from 'conventional-recommended-bump';
import * as semver from 'semver';
import * as execa from 'execa';
import * as Listr from 'listr';
import * as fs from 'fs';
import configGet from '../lib/config';
import {getTag, changeLog, releaseNotes} from '../lib/release';
import {gitlabRelease} from '../lib/gitlab-release';
import * as glob from 'glob';

const getRecommendedBump = ({tagPrefix}: {tagPrefix: string}) =>
    new Promise((res, rej) => {
        conventionalRecommendedBump(
            {
                preset: 'conventionalcommits',
                tagPrefix: tagPrefix,
            },
            (err: any, recommendation: any) =>
                err ? rej(err) : res(recommendation.releaseType),
        );
    });

const getCurrentBranch = async (): Promise<string> => {
    const {stdout} = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return process.env.CI_COMMIT_BRANCH || stdout || 'master';
};

export default class ReleaseSemver extends Command {
    static description = 'Create change logs and Gitlab releases in semantic versioning format';
    static args = [{name: 'release'}];

    async run() {
        const {args} = this.parse(ReleaseSemver);

        await execa('git', ['fetch', '--tags']);
        const tagPrefix = await configGet('git.tagPrefix', 'v');
        const latestTag = (await getTag({tagPrefix})) as string;

        const release = args.release || (await getRecommendedBump({tagPrefix}));

        let nextTag: string | null = '';
        if (['major', 'minor', 'patch'].includes(release)) {
            nextTag = semver.inc(latestTag, release);
        } else if (['alpha', 'beta', 'rc'].includes(release)) {
            if (latestTag.includes(release)) {
                nextTag = semver.inc(latestTag, 'prerelease');
            } else {
                nextTag = semver.inc(latestTag, 'prerelease', release);
            }
        } else {
            nextTag = release;
        }

        if (nextTag === null || semver.valid(nextTag) === null) {
            return this.error(`Invalid tag "${tagPrefix + nextTag}"`);
        }

        const notes = await releaseNotes({tagPrefix, newVersion: nextTag});
        if (notes.length === 0) {
            this.log('Sipping no commits since last release');
            return;
        }

        const tasks = new Listr([
            {
                title: 'Create the changelog',
                task: async () =>
                    await changeLog({tagPrefix, newVersion: nextTag as string}),
            },
            {
                title: 'Update package.json',
                skip: () => {
                    if (
                        fs.existsSync(process.cwd() + '/package.json') !== true
                    ) {
                        return 'Sipping no package.json file found';
                    }
                },
                task: async () => {
                    const packageFile = require(process.cwd() +
                        '/package.json');
                    packageFile.version = nextTag;
                    fs.writeFileSync(
                        'package.json',
                        JSON.stringify(packageFile, null, 4),
                    );
                },
            },
            {
                title: 'Update composer.json',
                skip: () => {
                    if (
                        fs.existsSync(process.cwd() + '/composer.json') !== true
                    ) {
                        return 'Sipping no composer.json file found';
                    }
                },
                task: async () => {
                    const composerFile = require(process.cwd() +
                        '/composer.json');
                    composerFile.version = nextTag;
                    fs.writeFileSync(
                        'composer.json',
                        JSON.stringify(composerFile, null, 4),
                    );
                },
            },
            {
                title: 'Create release comment',
                task: async () => {
                    await execa('git', ['add', '.']);
                    await execa('git', [
                        'commit',
                        '-m',
                        `chore(release): ${tagPrefix + nextTag}`,
                    ]);
                },
            },
            {
                title: 'Create tag',
                task: async () =>
                    await execa('git', ['tag', tagPrefix + nextTag]),
            },
            {
                title: 'Push to remote',
                task: async () => {
                    const origin = process.env.CI_PROJECT_URL?.replace(
                        /(http[s]:\/\/)(.*)/,
                        `$1oauth2:${process.env.CT_TOKEN}@$2.git`,
                    );

                    await execa('git', [
                        'push',
                        '-o ci.skip',
                        origin || 'origin',
                    ]);
                    await execa('git', ['push', origin || 'origin', '--tags']);
                },
            },
            {
                title: 'Create Gitlab release',
                task: async () => {
                    let assets: string[] = [];
                    for (const expresion of await configGet('assets', [])) {
                        const files = glob.sync(expresion, {nodir: true});
                        assets = assets.concat(files);
                    }

                    await gitlabRelease({
                        tag: tagPrefix + nextTag,
                        assets: assets,
                        notes: notes,
                    });
                },
            },
        ]);

        tasks.run().catch((err: any) => this.error(err.message));
    }
}
