import { Http, RequestMethods } from 'angular2/http';
import { Observable } from '@reactivex/rxjs/dist/cjs/Rx';
export interface IAuthConfig {
    headerName: string;
    headerPrefix: string;
    tokenName: string;
    tokenGetter: any;
    noJwtError: boolean;
}
/**
 * Sets up the authentication configuration.
 */
export declare class AuthConfig {
    config: any;
    headerName: string;
    headerPrefix: string;
    tokenName: string;
    tokenGetter: any;
    noJwtError: boolean;
    constructor(config?: any);
    getConfig(): {
        headerName: string;
        headerPrefix: string;
        tokenName: string;
        tokenGetter: any;
        noJwtError: boolean;
    };
}
/**
 * Allows for explicit authenticated HTTP requests.
 */
export declare class AuthHttp {
    private _config;
    tokenStream: Observable<string>;
    http: Http;
    constructor(config?: Object);
    request(method: RequestMethods, url: string, body?: string): any;
    get(url: string): any;
    post(url: string, body: string): any;
    put(url: string, body: string): any;
    delete(url: string, body?: string): any;
    options(url: string, body?: string): any;
    head(url: string, body?: string): any;
    patch(url: string, body: string): any;
}
/**
 * Helper class to decode and find JWT expiration.
 */
export declare class JwtHelper {
    urlBase64Decode(str: string): string;
    decodeToken(token: string): any;
    getTokenExpirationDate(token: string): Date;
    isTokenExpired(token: string, offsetSeconds?: number): boolean;
}
/**
 * Checks for presence of token and that token hasn't expired.
 * For use with the @CanActivate router decorator and NgIf
 */
export declare function tokenNotExpired(tokenName?: string, jwt?: string): boolean;
