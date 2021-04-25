import {Commit} from 'conventional-commits-parser';
const angularConfig = require('conventional-changelog-angular');

export const parserOpts = {
    headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
    headerCorrespondence: ['type', 'scope', 'subject'],
    noteKeywords: ['BREAKING CHANGE', 'SECURITY'],
    revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
    revertCorrespondence: ['header', 'hash'],
    issuePrefixes: ['#'],
};

export const transform = (commit: Commit, context: any) => {
    let discard = true;
    const issues: any = [];

    commit.notes.forEach((note: any) => {
        switch (note.title) {
            case 'SECURITY':
                note.title = 'SECURITY NOTICES';
                break;
            default:
                note.title = 'BREAKING CHANGES';
        }

        discard = false;
    });

    if (commit.type === 'feat') {
        commit.type = 'Features';
    } else if (commit.type === 'fix') {
        commit.type = 'Bug Fixes';
    } else if (commit.type === 'perf') {
        commit.type = 'Performance Improvements';
    } else if (commit.type === 'revert' || commit.revert) {
        commit.type = 'Reverts';
    } else if (discard) {
        return;
    } else if (commit.type === 'docs') {
        commit.type = 'Documentation';
    } else if (commit.type === 'style') {
        commit.type = 'Styles';
    } else if (commit.type === 'refactor') {
        commit.type = 'Code Refactoring';
    } else if (commit.type === 'test') {
        commit.type = 'Tests';
    } else if (commit.type === 'build') {
        commit.type = 'Build System';
    } else if (commit.type === 'ci') {
        commit.type = 'Continuous Integration';
    }

    if (commit.scope === '*') {
        commit.scope = '';
    }

    if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7);
    }

    if (typeof commit.subject === 'string') {
        let url = context.repository
            ? `${context.host}/${context.owner}/${context.repository}`
            : context.repoUrl;
        if (url) {
            url = `${url}/issues/`;
            // Issue URLs.
            commit.subject = commit.subject.replace(
                /#([0-9]+)/g,
                (_, issue) => {
                    issues.push(issue);
                    return `[#${issue}](${url}${issue})`;
                },
            );
        }

        if (context.host) {
            // User URLs.
            commit.subject = commit.subject.replace(
                /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
                (_, username) => {
                    if (username.includes('/')) {
                        return `@${username}`;
                    }

                    return `[@${username}](${context.host}/${username})`;
                },
            );
        }
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
            return true;
        }

        return false;
    });

    return commit;
};

export const preset = async () => {
    const angular = await angularConfig;

    angular.parserOpts = parserOpts;
    angular.conventionalChangelog.parserOpts = parserOpts;
    angular.recommendedBumpOpts.parserOpts = parserOpts;

    angular.writerOpts.transform = transform;
    angular.conventionalChangelog.writerOpts.transform = transform;

    return angular;
};

export default preset;
