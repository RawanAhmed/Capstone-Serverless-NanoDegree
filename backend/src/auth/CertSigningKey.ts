/**
 * Code from: https://github.com/hupe1980/serverless-todo/blob/master/backend/src/auth/CertSigningKey.ts
 **/

export interface CertSigningKey {
    kid: string;
    nbf: string;
    publicKey: string;
}