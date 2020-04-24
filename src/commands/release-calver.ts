import {Command, flags} from '@oclif/command';

import * as execa from 'execa';
import * as Listr from 'listr';
import configGet from '../lib/config';
import {getTag, changeLog, releaseNotes} from '../lib/release';
import {gitlabRelease} from '../lib/gitlab-release';

const getCurrentBranch = async (): Promise<string> => {
    const {stdout} = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return process.env.CI_COMMIT_BRANCH || stdout || 'master';
};

export default class ReleaseCalver extends Command {
    static description = 'describe the command here';

    static flags = {
        scope: flags.string({
            char: 's',
            description: 'The tag scope this can be used to scope your release',
            default: '',
        }),
    };

    async run() {
        const {flags} = this.parse(ReleaseCalver);

        await execa('git', ['fetch', '--tags']);
        const props: any = {};
        if (flags.scope) {
            props.packageName = flags.scope;
            props.lernaTags = true;
            props.tagPrefix = flags.scope + '@';
        } else {
            props.tagPrefix = await configGet('git.tagPrefix', 'v');
        }

        const latestTag = (await getTag(props)) as string;
        const date = new Date()
            .toISOString()
            .replace(/T.*/, '')
            .replace(/-/g, '.');

        let nextTag = '';
        if (latestTag === date) {
            nextTag = latestTag + '-1';
        } else if (latestTag.match(new RegExp(`^${date}`))) {
            nextTag = latestTag.replace(/(\d+)$/, match => match + 1);
        } else {
            nextTag = date;
        }

        props.newVersion = nextTag;
        const notes = await releaseNotes(props);
        if (notes.length === 0) {
            this.log('Sipping no commits since last release');
            return;
        }

        const tagPrefix = props.tagPrefix;
        const tasks = new Listr([
            {
                title: 'Create the changelog',
                skip: async () => {
                    const releaseScopes = (await configGet(
                        'git.releaseScopes',
                        [],
                    )) as Array<string>;

                    if (flags.scope && !releaseScopes.includes(flags.scope)) {
                        return (`"${flags.scope}" is not a release scope` as any) as boolean;
                    }

                    return false;
                },
                task: async () => changeLog(props),
            },
            {
                title: 'Create release comment',
                task: async () => {
                    await execa('git', ['add', 'CHANGELOG.md']);
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
                    const branch = await getCurrentBranch();
                    await execa('git', ['push', 'origin', branch]);
                    await execa('git', ['push', 'origin', tagPrefix + nextTag]);
                },
            },
            {
                title: 'Create Gitlab release',
                skip: async () => {
                    const releaseScopes = (await configGet(
                        'git.releaseScopes',
                        [],
                    )) as Array<string>;

                    if (flags.scope && !releaseScopes.includes(flags.scope)) {
                        return (`"${flags.scope}" is not a release scope` as any) as boolean;
                    }

                    return false;
                },
                task: async () => {
                    await gitlabRelease({
                        tag: tagPrefix + nextTag,
                        assets: [],
                        notes: notes,
                    });
                },
            },
        ]);

        tasks.run().catch((err: any) => this.error(err.message));
    }
}
