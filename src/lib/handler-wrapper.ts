import {error} from './logger';

type Callback<T> = (args: T) => Promise<number>;

// prettier-ignore
export const handlerWrapper = <T>(cb: Callback<T>) => async (args: T) => {
    try {
      process.exit(await cb(args));
    } catch (e) {
      error((e as any).message)
      process.exit(1);
    }
  };
