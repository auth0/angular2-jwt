import { Http, RequestMethod, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
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
    request(method: RequestMethod, url: string, body?: string): Observable<Response>;
    get(url: string): Observable<Response>;
    post(url: string, body: string): Observable<Response>;
    put(url: string, body: string): Observable<Response>;
    delete(url: string, body?: string): Observable<Response>;
    options(url: string, body?: string): Observable<Response>;
    head(url: string, body?: string): Observable<Response>;
    patch(url: string, body: string): Observable<Response>;
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
