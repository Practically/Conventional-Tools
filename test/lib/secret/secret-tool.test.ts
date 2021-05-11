import {expect, test} from '@oclif/test';
import * as secretTool from '../../../src/lib/secret/secret-tool';
import * as sinon from 'sinon';

const execa = require('../../../src/lib/execa');

describe('secret/secret-tool', () => {
    test.it('Should call get a secret', async () => {
        const mock = sinon.stub(execa, 'execa').returns({stdout: 'Testing'});
        const secret = await secretTool.getSecret('testing');
        expect(secret).to.eq('Testing');

        const calledWith = mock.calledWith('secret-tool');
        expect(calledWith).to.be.eq(true);

        mock.restore();
    });

    test.it('Should call create a secret', async () => {
        const mock = sinon.stub(execa, 'execa').returns({
            exitCode: 0,
            stdin: {
                write: () => true,
                destroy: () => true,
            },
        });

        const secret = await secretTool.storeSecret('testing', 'Testing');
        expect(secret).to.eq(true);

        const calledWith = mock.calledWith('secret-tool');
        expect(calledWith).to.be.eq(true);

        mock.restore();
    });

    test.it('Should call create a secret and fail on no 0 exit code', async () => {
        const mock = sinon.stub(execa, 'execa').returns({
            exitCode: 1,
            stdin: {
                write: () => true,
                destroy: () => true,
            },
        });

        const secret = await secretTool.storeSecret('testing', 'Testing');
        expect(secret).to.eq(false);

        const calledWith = mock.calledWith('secret-tool');
        expect(calledWith).to.be.eq(true);

        mock.restore();
    });
});
