import {Command, Flags} from '@oclif/core';

const gitRawCommits = require('git-raw-commits');
const chalk = require('chalk');
import configGet from '../lib/config';
import * as fs from 'fs';
import * as execa from 'execa';
import {parserOpts} from '../lib/conventional-config';

const lint = require('@commitlint/lint').default;

/**
 * Type constants
 */
const TYPE_WARNING = 1;
const TYPE_ERROR = 2;

/**
 * The commit report object after it has been run through commitlint
 */
interface CommitReport {
    /**
     * If the commit is valid or not
     */
    valid: boolean;
    /**
     * An array of warnings in the commit message
     */
    warnings: any[];
    /**
     * An array of errors in the commit message
     */
    errors: any[];
    /**
     * The raw commit that was run through commitlint
     */
    input: string;
}

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
    parserPreset: {parserOpts},
};

function lintCommits(params: any): Promise<Promise<CommitReport>[]> {
    return new Promise(resolve => {
        const promises: Promise<CommitReport>[] = [];
        gitRawCommits(params)
            .on('data', (commit: any) => {
                promises.push(
                    lint(
                        commit.toString(),
                        CONFIG.rules,
                        CONFIG.parserPreset.parserOpts,
                    ),
                );
            })
            .on('end', () => resolve(promises));
    });
}

export default class CommitLint extends Command {
    static description = 'Lint your commits against conventional commits';

    static flags = {
        level: Flags.integer({
            char: 'l',
            description: 'Error level to display',
            default: 2,
        }),
        from: Flags.string({
            char: 'f',
            description: 'The commit ref you want to lint from',
            default: '',
        }),
    };

    async run() {
        const {flags} = await this.parse(CommitLint);

        const scopes = await configGet('commit.scopes', []);
        if (scopes.length > 0) {
            CONFIG.rules['scope-enum'] = [
                TYPE_ERROR,
                'always',
                [...scopes, 'release'],
            ];
        }

        const root = await execa.command('git rev-parse --show-toplevel');
        if (fs.existsSync(`${root.stdout}/.git/COMMIT_EDITMSG`)) {
            const b = fs
                .readFileSync(`${root.stdout}/.git/COMMIT_EDITMSG`)
                .toString();

            const end =
                b.indexOf(
                    '------------------------ >8 ------------------------',
                ) || b.length;

            const editMsg = b.substring(0, end).replace(/^#.*$/gm, '').trim();

            if (editMsg.length) {
                const report = await lint(
                    editMsg,
                    CONFIG.rules,
                    CONFIG.parserPreset.parserOpts,
                );

                if (report.errors.length) {
                    this.log(`\n` + report.input);

                    this.error(
                        `Invalid commit message\n\n` +
                            report.errors
                                .map(
                                    (item: any) =>
                                        `${chalk.red('✖ ' + item.message)}`,
                                )
                                .join('\n'),
                    );
                }
            }
        }

        let exitCode = 0;
        const commits = await lintCommits({from: flags.from, to: 'HEAD'});
        for await (const commit of commits) {
            if (commit.input === 'Initial commit') {
                continue;
            }

            if (commit.errors.length > 0) {
                exitCode = 1;
            }

            let errors = '';
            let warnings = '';
            if (flags.level > 0 && commit.errors.length) {
                errors = commit.errors
                    .map((item: any) => `${chalk.red('✖ ' + item.message)}`)
                    .join('\n');
            }

            if (flags.level > 1 && commit.warnings.length) {
                warnings = commit.warnings
                    .map((item: any) => `${chalk.yellow('⚠ ' + item.message)}`)
                    .join('\n');
            }

            if (errors.length || warnings.length) {
                this.log(`${commit.input}\n${errors}\n${warnings}\n\n`);
            }
        }

        if (exitCode > 0) {
            this.error('Commitlint failed with errors', {
                code: '2',
                exit: false,
            });
        }

        this.exit(exitCode > 0 ? 2 : 0);
    }
}
