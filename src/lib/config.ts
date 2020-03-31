import {cosmiconfigSync} from 'cosmiconfig';

const getObjectItem = (obj: any, item: any, defaultValue: any = undefined) => {
    const arr = typeof item === 'string' ? item.split('.') : item;
    while (arr.length && obj) {
        obj = obj[arr.shift()];
    }

    return obj || defaultValue;
};

let config: any;
export const configGet = async (
    item: string,
    defaultValue: any,
): Promise<any> => {
    if (!config) {
        const explorerSync = cosmiconfigSync('ct');
        const searchedFor = explorerSync.search();
        config = searchedFor || {};
    }

    return getObjectItem(config.config, item, defaultValue);
};

export default configGet;
