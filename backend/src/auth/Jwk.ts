/**
 * Code from: https://github.com/hupe1980/serverless-todo/blob/master/backend/src/auth/Jwk.ts
 **/

export interface Jwk {
    kty: string;
    use: string;
    kid: string;
    x5c: string;
    nbf?: string;
}