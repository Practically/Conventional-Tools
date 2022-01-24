import * as gitSemverTags from 'git-semver-tags';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import * as conventionalChangelog from 'conventional-changelog';
import preset from './conventional-config';

/**
 * The release notes content of a release. The content if formatted in markdown
 * for writing to files or sending on to define change logs. This will make up
 * one section of a change log that will define a release
 */
export interface ReleaseNotes {
    /**
     * The title of the release notes
     */
    title: string;
    /**
     * The body content of the release notes
     */
    body: string;
}

export interface changeLogProps {
    tagPrefix: string;
    newVersion?: string;
    packageName?: string;
    lernaTags?: boolean;
}

export const getTag = ({tagPrefix, lernaTags, packageName}: changeLogProps) =>
    new Promise((res, rej) => {
        gitSemverTags(
            {
                tagPrefix: tagPrefix,
                lernaTags: lernaTags,
                package: packageName,
            },
            (err: any, tags: string[]) =>
                err
                    ? rej(err)
                    : res((tags[0] || '0.0.0').replace(tagPrefix, '')),
        );
    });

export const changeLog = (props: changeLogProps) =>
    new Promise<void>(async res => {
        const tmp = path.join(
            os.tmpdir(),
            crypto.randomBytes(8).readUInt32LE(0).toString(),
        );

        if (!fs.existsSync('CHANGELOG.md')) {
            fs.writeFileSync('CHANGELOG.md', '');
        }

        fs.createReadStream('CHANGELOG.md')
            .pipe(fs.createWriteStream(tmp))
            .on('finish', async () => {
                const {title, body} = await releaseNotes(props);
                fs.writeFileSync('CHANGELOG.md', `${title}\n\n${body}\n\n`);

                fs.createReadStream(tmp)
                    .pipe(fs.createWriteStream('CHANGELOG.md', {flags: 'a'}))
                    .on('finish', res);
            });
    });

export const releaseNotes = ({
    tagPrefix,
    newVersion,
    packageName,
}: changeLogProps): Promise<ReleaseNotes> =>
    new Promise(async resolve => {
        const config = await preset();
        let notes = '';
        conventionalChangelog(
            {
                config,
                lernaPackage: packageName,
            },
            {version: tagPrefix + newVersion},
            {path: process.cwd()},
        )
            .on('data', (data: any) => (notes += data.toString()))
            .on('end', () => {
                const title = notes.split('\n', 1)[0];
                const body = notes.replace(title, '').trim();
                resolve({
                    title,
                    body: body || '**NOTE:** This is a patch release only',
                });
            });
    });
