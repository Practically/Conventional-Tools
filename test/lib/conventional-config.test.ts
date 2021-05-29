import {expect, test} from '@oclif/test';
import * as config from '../../src/lib/conventional-config';

const conventionalCommitsParser = require('conventional-commits-parser');

describe('conventional-config', () => {
    test.it('To transforms type correctly', async () => {
        const commits = [
            {
                type: 'Features',
                message: 'feat(ting): commit message',
            },
            {
                type: 'Bug Fixes',
                message: 'fix(ting): commit message',
            },
            {
                type: 'Performance Improvements',
                message: 'perf(ting): commit message',
            },
            {
                type: 'Performance Improvements',
                message: 'perf(ting): commit message',
            },
            {
                type: 'Reverts',
                message: 'revert(ting): commit message',
            },
            {
                type: 'Documentation',
                message:
                    'docs(ting): commit message\n\nBREAKING CHANGE: change',
            },
            {
                type: 'Styles',
                message:
                    'style(ting): commit message\n\nBREAKING CHANGE: change',
            },
            {
                type: 'Tests',
                message:
                    'test(ting): commit message\n\nBREAKING CHANGE: change',
            },
            {
                type: 'Build System',
                message:
                    'build(ting): commit message\n\nBREAKING CHANGE: change',
            },
            {
                type: 'Continuous Integration',
                message: 'ci(ting): commit message\n\nBREAKING CHANGE: change',
            },
        ];

        commits.map(commit => {
            const transformed = config.transform(
                conventionalCommitsParser.sync(
                    commit.message,
                    config.parserOpts,
                ),
                {},
            );

            expect(transformed?.type).to.eq(commit.type);
        });
    });

    test.it('Adds link to the repo', () => {
        const commit = 'fix: this is a ting #123';
        const transformed = config.transform(
            conventionalCommitsParser.sync(commit, config.parserOpts),
            {repoUrl: 'https://test.com'},
        );

        expect(transformed?.subject).to.contain(
            '[#123](https://test.com/issues/123)',
        );
    });

    test.it('Star scope get replaced', () => {
        const commit = 'fix(*): message';
        const transformed = config.transform(
            conventionalCommitsParser.sync(commit, config.parserOpts),
            {},
        );

        expect(transformed?.scope).to.eq('');
    });
});
