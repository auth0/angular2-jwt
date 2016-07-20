import {provide, Injectable} from '@angular/core';
import {Http, Headers, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

// Avoid TS error "cannot find name escape"
declare var escape: any;

export interface IAuthConfig {
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  noJwtError: boolean;
  globalHeaders: Array<Object>;
  noTokenScheme?:boolean;
}

/**
 * Sets up the authentication configuration.
 */

export class AuthConfig {
  
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  noJwtError: boolean;
  noTokenScheme: boolean;
  globalHeaders: Array<Object>;

  constructor(config:any={}) {
    this.headerName = config.headerName || 'Authorization';
    if (config.headerPrefix) {
      this.headerPrefix = config.headerPrefix + ' ';
    } else if (config.noTokenScheme) {
      this.headerPrefix = '';
    } else {
      this.headerPrefix = 'Bearer ';
    }
    this.tokenName = config.tokenName || 'id_token';
    this.noJwtError = config.noJwtError || false;
    this.tokenGetter = config.tokenGetter || (() => localStorage.getItem(this.tokenName));
    this.globalHeaders = config.globalHeaders || [];
    this.noTokenScheme=config.noTokenScheme||false;
  }

  getConfig():IAuthConfig {
    return {
      headerName: this.headerName,
      headerPrefix: this.headerPrefix,
      tokenName: this.tokenName,
      tokenGetter: this.tokenGetter,
      noJwtError: this.noJwtError,
      noTokenScheme:this.noTokenScheme,
      globalHeaders: this.globalHeaders
    }
  }

}

/**
 * Allows for explicit authenticated HTTP requests.
 */

@Injectable()
export class AuthHttp {

  private _config: IAuthConfig;
  public tokenStream: Observable<string>;

  constructor(options: AuthConfig, private http: Http, private _defOpts?: RequestOptions) {
    this._config = options.getConfig();

    this.tokenStream = new Observable<string>((obs: any) => {
      obs.next(this._config.tokenGetter());
    });
  }
  
  setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
    if ( ! request.headers ) {
      request.headers = new Headers();
    }
    headers.forEach((header: Object) => {
      let key: string = Object.keys(header)[0];
      let headerValue: string = (<any>header)[key];
      request.headers.set(key, headerValue);
    });
  }

  request(url: string | Request, options?: RequestOptionsArgs) : Observable<Response> {
    if (typeof url === 'string') {
      return this.get(url, options); // Recursion: transform url from String to Request
    }
    // else if ( ! url instanceof Request ) {
    //   throw new Error('First argument must be a url string or Request instance.');
    // }

    // from this point url is always an instance of Request;
    let req: Request = <Request>url;
    if (!tokenNotExpired(null, this._config.tokenGetter())) {
      if (!this._config.noJwtError) {
        return new Observable<Response>((obs: any) => {
          obs.error(new Error('No JWT present or has expired'));
        });
      }
    } else {
      req.headers.set(this._config.headerName, this._config.headerPrefix + this._config.tokenGetter());
    }
    return this.http.request(req);
  }

  private mergeOptions(defaultOpts: RequestOptions, providedOpts: RequestOptionsArgs) {
    let newOptions = defaultOpts || new RequestOptions();
    if (this._config.globalHeaders) {
      this.setGlobalHeaders(this._config.globalHeaders, providedOpts);
    }

    newOptions = newOptions.merge(new RequestOptions(providedOpts));

    return newOptions;
  }

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions: RequestOptionsArgs) : Observable<Response> {
    let options = new RequestOptions(requestArgs);
    if (additionalOptions) {
      options = options.merge(additionalOptions);
    }
    return this.request(new Request(this.mergeOptions(this._defOpts, options)));
  }

  get(url: string, options?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, method: RequestMethod.Get }, options);
  }

  post(url: string, body: string, options?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, body: body, method: RequestMethod.Post }, options);
  }

  put(url: string, body: string, options ?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, body: body, method: RequestMethod.Put }, options);
  }

  delete(url: string, options ?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, method: RequestMethod.Delete }, options);
  }

  patch(url: string, body:string, options?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, body: body, method: RequestMethod.Patch }, options);
  }

  head(url: string, options?: RequestOptionsArgs) : Observable<Response> {
    return this.requestHelper({ url:  url, method: RequestMethod.Head }, options);
  }

}

/**
 * Helper class to decode and find JWT expiration.
 */

export class JwtHelper {

  public urlBase64Decode(str:string) {
    var output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {
        throw 'Illegal base64url string!';
      }
    }

    return decodeURIComponent(escape(typeof window === 'undefined' ? atob(output) : window.atob(output))); //polyfill https://github.com/davidchambers/Base64.js
  }

  public decodeToken(token:string) {
    var parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts');
    }

    var decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('Cannot decode the token');
    }

    return JSON.parse(decoded);
  }

  public getTokenExpirationDate(token:string) {
    var decoded: any;
    decoded = this.decodeToken(token);

    if(typeof decoded.exp === "undefined") {
      return null;
    }

    var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  public isTokenExpired(token:string, offsetSeconds?:number) {
    var date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;
    if (date === null) {
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

export function tokenNotExpired(tokenName = 'id_token', jwt?:string):boolean {

  const token:string = jwt || localStorage.getItem(tokenName);

  const jwtHelper = new JwtHelper();

  return token && !jwtHelper.isTokenExpired(token, null);
}

export const AUTH_PROVIDERS: any = [
  provide(AuthHttp, {
    useFactory: (http: Http, options: RequestOptions) => {
      return new AuthHttp(new AuthConfig(), http, options);
    },
    deps: [Http, RequestOptions]
  })
];

export function provideAuth(config = {}): any[] {
  return [
    provide(AuthHttp, {
      useFactory: (http: Http, options: RequestOptions) => {
        return new AuthHttp(new AuthConfig(config), http, options);
      },
      deps: [Http, RequestOptions]
    })
  ];
}
