import {log} from '../lib/logger';
import {getSourceControlProvider} from '../lib/source-control';

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

const footerMessages: Record<string, string> = {
  fix: 'Fixes Issue',
};

export const builder = {} as const;

// export async function handler(
//   _: InferredOptionTypes<typeof builder>,
// ): Promise<void> {

export async function handler(): Promise<number> {
  const sourceControl = await getSourceControlProvider();
  if (!sourceControl) {
    throw new Error('No source control provider found');
  }

  const branch = await sourceControl.getBranchName();
  if (!branch) {
    throw new Error('No branch found');
  }

  const m = branch.match(/(\w+)\/([a-z0-9]+)-?/);
  // TODO(AdeAttwood): Sort out getting stuff from the config `.ctrc.yml`
  const scopes: string[] = [];

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

  if (!m?.[1] || !m[2]) {
    log(`\n\n${message}`);
    return 0;
  }

  const t = types.includes(m[1]) ? m[1] : 'edit';
  const footer = m[2].match(/\d+/)
    ? `${footerMessages[t] || 'Ref'}: #${m[2]}`
    : '';

  log(`${t}(edit): edit

${footer}
${message}
`);

  return 0;
}

export default {
  builder,
  handler: async () => {
    await handler();
  },
};
