import {Command, flags} from '@oclif/command';

const lint = require('@commitlint/lint');
const gitRawCommits = require('git-raw-commits');
import chalk from 'chalk';
import configGet from '../lib/config';
import * as fs from 'fs';
import * as execa from 'execa';

/**
 * Type constants
 */
const TYPE_WARNING = 1;
const TYPE_ERROR = 2;

/**
 * Base config
 */
const CONFIG: any = {
    rules: {
        'body-leading-blank': [TYPE_WARNING, 'always'],
        'footer-leading-blank': [TYPE_WARNING, 'always'],
        'header-max-length': [TYPE_ERROR, 'always', 72],
        'scope-case': [TYPE_ERROR, 'always', 'lower-case'],
        'subject-case': [
            TYPE_ERROR,
            'never',
            ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
        ],
        'subject-empty': [TYPE_ERROR, 'never'],
        'subject-full-stop': [TYPE_ERROR, 'never', '.'],
        'type-case': [TYPE_ERROR, 'always', 'lower-case'],
        'type-empty': [TYPE_ERROR, 'never'],
        'references-empty': [TYPE_WARNING, 'never'],
        'type-enum': [
            TYPE_ERROR,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'improvement',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
            ],
        ],
    },
    parserPreset: {
        parserOpts: {
            headerPattern: {},
            breakingHeaderPattern: {},
            headerCorrespondence: ['type', 'scope', 'subject'],
            noteKeywords: ['BREAKING CHANGE'],
            revertPattern: {},
            revertCorrespondence: ['header', 'hash'],
            issuePrefixes: ['#'],
        },
    },
};

export default class CommitLint extends Command {
    static description = 'describe the command here';

    static flags = {
        level: flags.integer({
            char: 'l',
            description: 'Error level to display',
            default: 2,
        }),
        from: flags.string({
            char: 'f',
            description: 'The commit ref you want to lint from',
            default: '',
        }),
    };

    async run() {
        const {flags} = this.parse(CommitLint);

        const scopes = await configGet('commit.scopes', []);
        if (scopes.length > 0) {
            CONFIG.rules['scope-enum'] = [TYPE_ERROR, 'always', scopes];
        }

        let exitCode = 0;
        let commitCount = 0;
        let finalCommitCount = -1;
        let processedCount = 0;

        const processCommit = (commit: string) => {
            commitCount++;
            lint(commit, CONFIG.rules, CONFIG.parserPreset.parserOpts).then(
                (report: any) => {
                    processedCount++;
                    if (!report.errors.length && !report.warnings.length) {
                        if (finalCommitCount === processedCount) {
                            process.exit(exitCode);
                        }
                        return;
                    }
                    let errors = '';
                    let warnings = '';
                    if (flags.level > 0 && report.errors.length) {
                        errors = report.errors
                            .map(
                                (item: any) =>
                                    `${chalk.red('✖ ' + item.message)}`,
                            )
                            .join('\n');
                    }

                    if (flags.level > 1 && report.warnings.length) {
                        warnings = report.warnings
                            .map(
                                (item: any) =>
                                    `${chalk.yellow('⚠ ' + item.message)}`,
                            )
                            .join('\n');
                    }

                    if (errors.length || warnings.length) {
                        process.stdout.write(
                            `${report.input}\n${errors}\n${warnings}\n\n`,
                        );
                    }

                    if (report.errors.length) {
                        exitCode = 1;
                    }

                    if (finalCommitCount === processedCount) {
                        process.exit(exitCode);
                    }
                },
            );
        };

        let editMsg = '';
        const root = await execa.command('git rev-parse --show-toplevel');
        if (fs.existsSync(`${root.stdout}/.git/COMMIT_EDITMSG`)) {
            const b = fs
                .readFileSync(`${root.stdout}/.git/COMMIT_EDITMSG`)
                .toString();

            const end =
                b.indexOf(
                    '------------------------ >8 ------------------------',
                ) || b.length;

            editMsg = b
                .substring(0, end)
                .replace(/^#.*$/gm, '')
                .trim();

            processCommit(editMsg);
        }

        gitRawCommits({
            from: flags.from,
            to: 'HEAD',
        })
            .on('data', (rawCommit: any) => {
                const commit = rawCommit.toString();
                if (
                    commit.trim() === 'Initial commit' ||
                    commit.trim() === editMsg
                ) {
                    return;
                }

                processCommit(commit);
            })
            .on('end', () => {
                finalCommitCount = commitCount;
                if (finalCommitCount === processedCount) {
                    process.exit(exitCode);
                }
            });
    }
}
