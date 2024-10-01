import {getSourceControlProvider} from '../lib/source-control';
import {log} from '../lib/logger';
import lint from '@commitlint/lint';
import {Arguments, Argv} from 'yargs';
import {handlerWrapper} from '../lib/handler-wrapper';

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
    headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
    headerCorrespondence: ['type', 'scope', 'subject'],
    noteKeywords: ['BREAKING CHANGE', 'SECURITY'],
    revertPattern:
      /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
    revertCorrespondence: ['header', 'hash'],
    issuePrefixes: ['#'],
  },
};

type Options = Record<string, never>;

export function builder(argv: Argv<Options>) {
  return argv
    .positional('level', {
      type: 'number',
      default: 2,
      alias: 'l',
      describe: 'The level of severity to enforce',
    })
    .positional('from', {
      type: 'string',
      default: '',
      alias: 'f',
      describe: 'The commit ref to start linting from',
    })
    .string('test');
}

export async function handler(args: Arguments<Options>): Promise<number> {
  const [level, from] = args._;

  const sourceControl = await getSourceControlProvider();
  if (!sourceControl) {
    throw new Error('No source control provider found');
  }

  const currentCommitMessage = await sourceControl.getCurrentCommitMessage();

  if (currentCommitMessage !== null) {
    const report = await lint(currentCommitMessage, CONFIG.rules);

    if (!report.valid) {
      log('\n' + report.input);
      log(`Invalid commit message\n\n ${report.errors.join('\n')}`);

      return 1;
    }
  }

  const commits = await sourceControl.getCommits(from as string, 'HEAD');

  let hasErrors = false;
  for (const commit of commits) {
    if (commit === 'Initial commit') {
      continue;
    }

    const report = await lint(commit, CONFIG.rules);

    if (!report.valid) {
      hasErrors = true;
    }

    let errors = '';
    let warnings = '';

    if (typeof level === 'number') {
      if (level > 0 && hasErrors) {
        errors = report.errors
          .map((item: any) => `✖ ${item.message}`)
          .join('\n');
      }

      if (level > 1 && report.warnings.length) {
        warnings = report.warnings
          .map((item: any) => `⚠ ${item.message}`)
          .join('\n');
      }
    }

    if (errors.length || warnings.length) {
      log(`${report.input}\n${errors}\n${warnings}\n\n`);
    }
  }

  return hasErrors ? 2 : 0;
}

export default {builder, handler: handlerWrapper(handler)};
