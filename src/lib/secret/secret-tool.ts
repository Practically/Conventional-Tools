import {execa} from '../execa';

export const storeSecret = async (key: string, value: string) => {
    const process = execa('secret-tool', [
        'store',
        `--label=Conventional Tools: ${key}`,
        'app',
        'conventional-tools',
        'account',
        key,
    ]);

    process.stdin?.write(value);
    process.stdin?.destroy();

    await process;
    return process.exitCode === 0;
};

export const getSecret = async (key: string) => {
    const {stdout} = await execa('secret-tool', [
        'lookup',
        'app',
        'conventional-tools',
        'account',
        key,
    ]);

    return stdout;
};

export default {storeSecret, getSecret};
