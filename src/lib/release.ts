import * as gitSemverTags from 'git-semver-tags';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import * as conventionalChangelog from 'conventional-changelog';
import preset from './conventional-config';

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

export const changeLog = ({
    tagPrefix,
    newVersion,
    packageName,
}: changeLogProps) =>
    new Promise<void>(async res => {
        const config = await preset();
        const tmp = path.join(
            os.tmpdir(),
            crypto.randomBytes(8).readUInt32LE(0).toString(),
        );
        fs.createReadStream('CHANGELOG.md')
            .pipe(fs.createWriteStream(tmp))
            .on('finish', () => {
                conventionalChangelog(
                    {
                        config,
                        lernaPackage: packageName,
                    },
                    {version: tagPrefix + newVersion},
                    {path: process.cwd()},
                )
                    .pipe(fs.createWriteStream('CHANGELOG.md'))
                    .on('finish', function () {
                        fs.createReadStream(tmp)
                            .pipe(
                                fs.createWriteStream('CHANGELOG.md', {
                                    flags: 'a',
                                }),
                            )
                            .on('finish', () => res());
                    });
            });
    });

export const releaseNotes = ({
    tagPrefix,
    newVersion,
    packageName,
}: changeLogProps): Promise<string> =>
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
            .on('end', () => resolve(notes.replace(/^#.*/, '').trim()));
    });
