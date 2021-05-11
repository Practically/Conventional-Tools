import SecretTool from './secret-tool';

export const storeSecret = async (key: string, value: string) => {
    const os = process.platform;
    switch (os) {
        case 'linux':
            return SecretTool.storeSecret(key, value);

        default:
            throw new Error(`Cannot store secret unsupported OS '${os}'`);
    }
};

export const getSecret = async (key: string) => {
    const os = process.platform;
    switch (os) {
        case 'linux':
            return SecretTool.getSecret(key);

        default:
            throw new Error(`Cannot get secret unsupported OS '${os}'`);
    }
};

export default {storeSecret, getSecret};
