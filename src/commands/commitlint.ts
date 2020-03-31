import {Command, flags} from '@oclif/command';

const lint = require('@commitlint/lint');
const gitRawCommits = require('git-raw-commits');
import chalk from 'chalk';
import configGet from '../lib/config';

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
    };

    async run() {
        const {flags} = this.parse(CommitLint);

        const scopes = await configGet('commit.scopes', []);
        CONFIG.rules['references-empty'] = [TYPE_WARNING, 'never'];
        if (scopes.length > 0) {
            CONFIG.rules['scope-enum'] = [TYPE_ERROR, 'always', scopes];
        }

        let exitCode = 0;
        gitRawCommits({
            from: 'ORIG_HEAD',
            //path: '.',
        })
            .on('data', (data: any) => {
                lint(
                    data.toString(),
                    CONFIG.rules,
                    CONFIG.parserPreset.parserOpts,
                ).then((report: any) => {
                    if (!report.errors.length && !report.warnings.length) {
                        return;
                    }

                    let errors = '';
                    let warnings = '';

                    if (flags.level > 0 && report.errors.length) {
                        errors = report.errors
                            .map(
                                (item: any) =>
                                    `${chalk.red('✖ ' + item.message)}\n`,
                            )
                            .join('\n');
                    }

                    if (flags.level > 1 && report.warnings.length) {
                        warnings = report.warnings
                            .map(
                                (item: any) =>
                                    `${chalk.yellow('⚠ ' + item.message)}\n`,
                            )
                            .join('\n');
                    }

                    if (errors.length || warnings.length) {
                        process.stdout.write(
                            `${report.input}\n\n${errors}${warnings}\n`,
                        );
                        exitCode = 1;
                    }
                });
            })
            .on('close', () => {
                process.exit(exitCode);
            });
    }
}
