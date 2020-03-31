import * as gitSemverTags from 'git-semver-tags';
import * as fs from 'fs';
import * as conventionalChangelog from 'conventional-changelog';
const tempfile = require('tempfile');

export const getTag = ({tagPrefix}: {tagPrefix: string}) =>
    new Promise((res, rej) => {
        gitSemverTags(
            {
                tagPrefix: tagPrefix,
            },
            (err: any, tags: string[]) =>
                err
                    ? rej(err)
                    : res((tags[0] || '0.0.0').replace(tagPrefix, '')),
        );
    });

export interface changeLogProps {
    tagPrefix: string;
    newVersion: string;
}

export const changeLog = ({tagPrefix, newVersion}: changeLogProps) =>
    new Promise(res => {
        const tmp = tempfile();
        fs.createReadStream('CHANGELOG.md')
            .pipe(fs.createWriteStream(tmp))
            .on('finish', () => {
                conventionalChangelog(
                    {
                        preset: 'angular',
                    },
                    {
                        version: tagPrefix + newVersion,
                    } /** for when we implement sub packages, { path } */,
                )
                    .pipe(fs.createWriteStream('CHANGELOG.md'))
                    .on('finish', function() {
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
}: changeLogProps): Promise<string> =>
    new Promise(resolve => {
        let notes = '';
        conventionalChangelog(
            {
                preset: 'angular',
            },
            {
                version: tagPrefix + newVersion,
            } /** for when we implement sub packages, { path } */,
        )
            .on('data', (data: any) => (notes += data.toString()))
            .on('end', () => resolve(notes.replace(/^#.*/, '').trim()));
    });
