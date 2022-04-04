import {Command} from '@oclif/core';

import configGet from '../lib/config';
import * as execa from 'execa';

const getCurrentBranch = async (): Promise<string> => {
    const {stdout} = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return stdout || 'master';
};

const types = [
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
];

const footerMessages: {[key: string]: string} = {
    fix: 'Fixes Issue',
};

export default class Commitgen extends Command {
    static description = 'Commit message generator';

    async run() {
        const {args} = await this.parse(Commitgen);

        const branch = await getCurrentBranch();
        const m = branch.match(/(\w+)\/([a-z0-9]+)-?/);
        const scopes = await configGet('commit.scopes', []);

        const message = `# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# Valid types are:
#   ${types.join(', ').replace(/(.{62,72})(\s+\r?|\r)/g, '$1\n#   ')}
#
# Valid scopes for this project are:
#   ${scopes.join(', ').replace(/(.{62,72})(\s+\r?|\r)/g, '$1\n#   ')}
#
`;
        if (!m || !m[1] || !m[2]) {
            this.log(`\n\n${message}`);
            return;
        }

        const t = types.includes(m[1]) ? m[1] : 'edit';
        const footer = m[2].match(/\d+/)
            ? `${footerMessages[t] || 'Ref'}: #${m[2]}`
            : '';
        this.log(`${t}(edit): edit

${footer}
${message}
`);
    }
}
