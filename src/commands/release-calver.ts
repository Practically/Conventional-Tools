import {Command, Flags} from '@oclif/core';

import * as Listr from 'listr';
import configGet from '../lib/config';
import {getTag, changeLog, releaseNotes} from '../lib/release';
import {gitlabRelease} from '../lib/gitlab-release';
import {githubRelease} from '../lib/github-release';
import * as glob from 'glob';
import * as secrets from '../lib/secret';
import {execa} from '../lib/execa';

export default class ReleaseCalver extends Command {
    static description =
        'Create change logs and Gitlab releases in calendar versioning format';

    static flags = {
        scope: Flags.string({
            char: 's',
            description: 'The tag scope this can be used to scope your release',
            default: '',
        }),
    };

    async run() {
        const {flags} = await this.parse(ReleaseCalver);

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
        if (notes.body.length === 0) {
            this.log('Sipping no commits since last release');
            return;
        }

        const provider = await configGet('git.provider', 'gitlab');
        const host = await configGet(
            'git.host',
            provider === 'gitlab' ? 'gitlab.com' : 'api.github.com',
        );
        const project = await configGet('git.project', '');
        const secret = process.env.CT_TOKEN || (await secrets.getSecret(host));
        if (!secret) {
            this.error(
                'Invalid secret. See https://conventional-tools.practically.io/release-config/',
            );
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
                        return `"${flags.scope}" is not a release scope` as any as boolean;
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
                        `chore(release): ${tagPrefix + nextTag} [skip ci]`,
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
                        origin || 'origin',
                        '-o',
                        'ci.skip',
                    ]);

                    await execa('git', ['push', origin || 'origin', '--tags']);
                },
            },
            {
                title: 'Create release',
                skip: async () => {
                    const releaseScopes = (await configGet(
                        'git.releaseScopes',
                        [],
                    )) as Array<string>;

                    if (flags.scope && !releaseScopes.includes(flags.scope)) {
                        return `"${flags.scope}" is not a release scope` as any as boolean;
                    }

                    return false;
                },
                task: async () => {
                    let assets: string[] = [];
                    for (const expresion of await configGet('assets', [])) {
                        const files = glob.sync(expresion, {nodir: true});
                        assets = assets.concat(files);
                    }

                    if (provider === 'gitlab') {
                        await gitlabRelease({
                            tag: tagPrefix + nextTag,
                            assets: assets,
                            notes: notes.body,
                            provider: provider,
                            host: host,
                            project: project,
                            secret: secret,
                        });
                    } else {
                        await githubRelease({
                            tag: tagPrefix + nextTag,
                            notes: notes.body,
                            host: host,
                            project: project,
                            secret: secret,
                            assets: assets,
                        });
                    }
                },
            },
        ]);

        try {
            await tasks.run();
        } catch (err: any) {
            if (typeof err.message === 'string') {
                this.error(err.message);
            } else {
                this.error('Unable to release your package');
            }
        }
    }
}
