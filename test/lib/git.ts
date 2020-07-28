import * as execa from 'execa';

/**
 * Initialises a repository in your current working directory
 */
export function init() {
    return execa('git', ['init']);
}

/**
 * Creates and empty commit so you can populate your tree
 */
export function commit(message: string) {
    return execa('git', ['commit', '--allow-empty', '-m', message]);
}

/**
 * Create and checkout a new branch
 */
export function branch(name: string) {
    return execa('git', ['checkout', '-b', name]);
}

export async function getBranch(): Promise<string> {
    return (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout;
}
