import {Command, flags} from '@oclif/command';

import configGet from '../lib/config';
import {changeLog} from '../lib/release';
import * as execa from 'execa';

export default class Changelog extends Command {
    static description = 'Generate a changelog from commits';

    static args = [{name: 'tag'}];

    static flags = {
        scope: flags.string({
            char: 's',
            description: 'The tag scope this can be used to scope your changelog',
            default: '',
        }),
    };

    async run() {
        const {args, flags} = this.parse(Changelog);

        const props: any = {};
        if (flags.scope) {
            props.packageName = flags.scope;
            props.lernaTags = true;
            props.tagPrefix = flags.scope + '@';
        } else {
            props.tagPrefix = await configGet('git.tagPrefix', 'v');
        }

        await execa('git', ['fetch', '--tags']);
        await changeLog({...props, newVersion: args.tag as string})
    }
}
