import {
    Http,
    Headers,
    Request,
    RequestOptions,
    RequestOptionsArgs,
    RequestMethod,
    Response,
    HttpModule
} from "@angular/http";
import {Injectable, Provider, NgModule, Optional, SkipSelf, ModuleWithProviders} from "@angular/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/defer";
import "rxjs/add/operator/mergeMap";

export interface IAuthConfig {
  globalHeaders: Array<Object>;
  headerName: string;
  headerPrefix: string;
  noJwtError: boolean;
  noClientCheck: boolean;
  noTokenScheme?: boolean;
  tokenGetter: () => string | Promise<string>;
  tokenName: string;
}

export interface IAuthConfigOptional {
    headerName?: string;
    headerPrefix?: string;
    tokenName?: string;
    tokenGetter?: () => string | Promise<string>;
    noJwtError?: boolean;
    noClientCheck?: boolean;
    globalHeaders?: Array<Object>;
    noTokenScheme?: boolean;
}

export class AuthConfigConsts {
    public static DEFAULT_TOKEN_NAME = 'token';
    public static DEFAULT_HEADER_NAME = 'Authorization';
    public static HEADER_PREFIX_BEARER = 'Bearer ';
}

const AuthConfigDefaults: IAuthConfig = {
    headerName: AuthConfigConsts.DEFAULT_HEADER_NAME,
    headerPrefix: null,
    tokenName: AuthConfigConsts.DEFAULT_TOKEN_NAME,
    tokenGetter: () => localStorage.getItem(AuthConfigDefaults.tokenName) as string,
    noJwtError: false,
    noClientCheck: false,
    globalHeaders: [],
    noTokenScheme: false
};

/**
 * Sets up the authentication configuration.
 */

export class AuthConfig {

  private _config: IAuthConfig;

  constructor(config?: IAuthConfigOptional) {
    config = config || {};
    this._config = objectAssign({}, AuthConfigDefaults, config);
    if (this._config.headerPrefix) {
      this._config.headerPrefix += ' ';
    } else if (this._config.noTokenScheme) {
      this._config.headerPrefix = '';
    } else {
      this._config.headerPrefix = AuthConfigConsts.HEADER_PREFIX_BEARER;
    }

    if (config.tokenName && !config.tokenGetter) {
      this._config.tokenGetter = () => localStorage.getItem(config.tokenName) as string;
    }
  }

  public getConfig():IAuthConfig {
    return this._config;
  }

}

export class AuthHttpError extends Error {
}

/**
 * Allows for explicit authenticated HTTP requests.
 */

@Injectable()
export class AuthHttp {

  private config: IAuthConfig;
  public tokenStream: Observable<string>;

  constructor(options: AuthConfig, private http: Http, private defOpts?: RequestOptions) {
    this.config = options.getConfig();

    this.tokenStream = new Observable<string>((obs: any) => {
      obs.next(this.config.tokenGetter());
    });
  }

  private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
    let newOptions = defaultOpts || new RequestOptions();
    if (this.config.globalHeaders) {
      this.setGlobalHeaders(this.config.globalHeaders, providedOpts);
    }

    newOptions = newOptions.merge(new RequestOptions(providedOpts));

    return newOptions;
  }

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
    let options = new RequestOptions(requestArgs);
    if (additionalOptions) {
      options = options.merge(additionalOptions);
    }
    return this.request(new Request(this.mergeOptions(options, this.defOpts)));
  }

  public requestWithToken(req: Request, token: string): Observable<Response> {
    if (!this.config.noClientCheck && !tokenNotExpired(undefined, token)) {
      if (!this.config.noJwtError) {
        return new Observable<Response>((obs: any) => {
          obs.error(new AuthHttpError('No JWT present or has expired'));
        });
      }
    } else {
      req.headers.set(this.config.headerName, this.config.headerPrefix + token);
    }

    return this.http.request(req);
  }

  public setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
    if (!request.headers) {
      request.headers = new Headers();
    }
    headers.forEach((header: Object) => {
      let key: string = Object.keys(header)[0];
      let headerValue: string = (header as any)[key];
      (request.headers as Headers).set(key, headerValue);
    });
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    if (typeof url === 'string') {
      return this.get(url, options); // Recursion: transform url from String to Request
    }
    // else if ( ! url instanceof Request ) {
    //   throw new Error('First argument must be a url string or Request instance.');
    // }

    // from this point url is always an instance of Request;
    let req: Request = url as Request;

    // Create a cold observable and load the token just in time
    return Observable.defer(() => {
      let token: string | Promise<string> = this.config.tokenGetter();
      if (token instanceof Promise) {
        return Observable.fromPromise(token).mergeMap((jwtToken: string) => this.requestWithToken(req, jwtToken));
      } else {
        return this.requestWithToken(req, token);
      }
    });
  }

  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Get, url: url }, options);
  }

  public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Post, url: url }, options);
  }

  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Put, url: url }, options);
  }

  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Delete, url: url }, options);
  }

  public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Patch, url: url }, options);
  }

  public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Head, url: url }, options);
  }

  public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Options, url: url }, options);
  }

}

/**
 * Helper class to decode and find JWT expiration.
 */

export class JwtHelper {

  public urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {
        throw 'Illegal base64url string!';
      }
    }
    return this.b64DecodeUnicode(output);
  }

  // credits for decoder goes to https://github.com/atk
  private b64decode(str: string): string {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output: string = '';

    str = String(str).replace(/=+$/, '');

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }

    for (
      // initialize result and counters
      let bc: number = 0, bs: any, buffer: any, idx: number = 0;
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  }

  // https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
  private b64DecodeUnicode(str: any) {
    return decodeURIComponent(Array.prototype.map.call(this.b64decode(str), (c: any) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  public decodeToken(token: string): any {
    let parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts');
    }

    let decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('Cannot decode the token');
    }

    return JSON.parse(decoded);
  }

  public getTokenExpirationDate(token: string): Date {
    let decoded: any;
    decoded = this.decodeToken(token);

    if (!decoded.hasOwnProperty('exp')) {
      return null;
    }

    let date = new Date(0); // The 0 here is the key, which sets the date to the epoch
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  public isTokenExpired(token: string, offsetSeconds?: number): boolean {
    let date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;

    if (date == null) {
      return false;
    }

    // Token expired?
    return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
  }
}

/**
 * Checks for presence of token and that token hasn't expired.
 * For use with the @CanActivate router decorator and NgIf
 */
export function tokenNotExpired(tokenName = AuthConfigConsts.DEFAULT_TOKEN_NAME, jwt?:string): boolean {

  const token: string = jwt || localStorage.getItem(tokenName);

  const jwtHelper = new JwtHelper();

  return token != null && !jwtHelper.isTokenExpired(token);
}

export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: AuthHttp,
    deps: [Http, RequestOptions],
    useFactory: (http: Http, options: RequestOptions) => {
      return new AuthHttp(new AuthConfig(), http, options);
    }
  }
];

export function provideAuth(config?: IAuthConfigOptional): Provider[] {
  return [
    {
      provide: AuthHttp,
      deps: [Http, RequestOptions],
      useFactory: (http: Http, options: RequestOptions) => {
        return new AuthHttp(new AuthConfig(config), http, options);
      }
    }
  ];
}

let hasOwnProperty = Object.prototype.hasOwnProperty;
let propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val: any) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  
  return Object(val);
}

function objectAssign(target: any, ...source: any[]) {
  let from: any;
  let to = toObject(target);
  let symbols: any;
  
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    
    if ((<any>Object).getOwnPropertySymbols) {
      symbols = (<any>Object).getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
}
/**
 * Module for angular2-jwt
 * @experimental
 */
@NgModule({
  imports: [HttpModule],
  providers: [AuthHttp, JwtHelper]
})
export class AuthModule {
  constructor(@Optional() @SkipSelf() parentModule: AuthModule) {
    if (parentModule) {
      throw new Error(
          'AuthModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: AuthConfig): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: AuthConfig, useValue: config}
      ]
    };
  }
}
