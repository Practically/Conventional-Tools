import {Command} from '@oclif/command';
import secrets from '../lib/secret';
import cli from 'cli-ux';
import chalk = require('chalk');

export default class Secret extends Command {
    static description = 'Stores a secret into the desktop secret store';
    static args = [{name: 'host', required: true}];

    async run() {
        const {args} = this.parse(Secret);

        const password = await cli.prompt(
            `Please enter the secret for '${args.host}'`,
            {type: 'hide'},
        );

        try {
            await secrets.storeSecret(args.host, password);
            this.log(chalk.green('Secret has been successfully stored'));
        } catch (e) {
            if (e.message.includes('unsupported OS')) {
                this.error(
                    chalk.red(
                        'Can not store secret your OS is not supported. Please use the environment variable "CT_TOKEN"',
                    ),
                );
            } else {
                this.error(chalk.red(e.message));
            }
        }
    }
}
