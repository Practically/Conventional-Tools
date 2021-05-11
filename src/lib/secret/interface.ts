export interface SecretStore {
    /**
     * Saves a secret into the secret storage
     */
    storeSecret: (host: string, value: string) => Promise<boolean>;
    /**
     * Gets a secret from the secret storage
     */
    getSecret: (host: string) => Promise<string>;
}
