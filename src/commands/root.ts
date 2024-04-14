import {handlerWrapper} from '../lib/handler-wrapper';
import {log} from '../lib/logger';
import {getSourceControlProvider} from '../lib/source-control';

export const builder = {} as const;

export async function handler(): Promise<number> {
  const sourceControl = await getSourceControlProvider();
  if (!sourceControl) {
    throw new Error('No source control provider found');
  }

  log(await sourceControl.root());

  return 0;
}

export default {builder, handler: handlerWrapper(handler)};
