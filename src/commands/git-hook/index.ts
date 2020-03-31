import {Command} from '@oclif/command';

import {cosmiconfigSync} from 'cosmiconfig';
import * as execa from 'execa';

const getObjectItem = (obj: any, item: any, defaultValue: any = undefined) => {
    const arr = typeof item === 'string' ? item.split('.') : item;
    while (arr.length && obj) {
        obj = obj[arr.shift()];
    }

    return obj || defaultValue;
};

let config: any;
const configGet = async (item: any, defaultValue: any) => {
    if (!config) {
        const explorerSync = cosmiconfigSync('ct');
        const searchedFor = explorerSync.search();
        config = searchedFor || {};
    }

    return getObjectItem(config.config, item, defaultValue);
};

export default class GitHook extends Command {
    static description = 'describe the command here';

    static strict = false;
    static args = [{name: 'hook'}];
    async run() {
        const {args, argv} = this.parse(GitHook);

        const hooks = await configGet(`hooks.${args.hook}`, []);
        argv.shift();
        for (let hook of hooks) {
            for (const i in argv) {
                hook = hook.replace(`$\{${i}\}`, argv[i]);
            }

            try {
                await execa.command(hook);
            } catch (e) {
                console.log(e.exitCode);

                process.exit(1);
            }
        }
    }
}
