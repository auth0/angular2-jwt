import {Injectable, Injector} from 'angular2/core';
import {Http, HTTP_PROVIDERS, Headers, BaseRequestOptions, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

// Avoid TS error "cannot find name escape"
declare var escape: any;

export interface IAuthConfig {
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  refresh: any;
  refreshOffset: number;
  noJwtError: boolean;
}

/**
 * Sets up the authentication configuration.
 */

export class AuthConfig {

  config: any;
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  refresh: any;
  refreshOffset: number;
  noJwtError: boolean;

  constructor(config?: any) {
    this.config = config || {};
    this.headerName = this.config.headerName || 'Authorization';
    if(this.config.headerPrefix) {
      this.headerPrefix = this.config.headerPrefix + ' ';
    } else {
      this.headerPrefix = 'Bearer ';
    }
    this.tokenName = this.config.tokenName || 'id_token';
    this.tokenGetter = this.config.tokenGetter || (() => localStorage.getItem(this.tokenName));
    this.refresh = this.config.refresh || (() => Observable.of(null));
    this.refreshOffset = this.config.refreshOffset || 60;
    this.noJwtError = this.config.noJwtError || false;
  }

  getConfig() {
    return {
      headerName: this.headerName,
      headerPrefix: this.headerPrefix,
      tokenName: this.tokenName,
      tokenGetter: this.tokenGetter,
      refresh: this.refresh,
      refreshOffset: this.refreshOffset,
      noJwtError: this.noJwtError
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
  private jwtHelper:JwtHelper;

  constructor(options: AuthConfig, private http: Http) {
    this._config = options.getConfig();
    this.jwtHelper = new JwtHelper();

    this.tokenStream = new Observable((obs: any) => {
      obs.next(this._config.tokenGetter())
    });
  }

  public request(url: string | Request, options?: RequestOptionsArgs) : Observable<Response> {
    let responseObservable:any;

    // this is observable as it may need to come from an http call ...
    let refreshToken:Observable<string>;

    var token = this._config.tokenGetter()
    if (token && this.jwtHelper.isTokenExpired(token, this._config.refreshOffset)) {
      refreshToken = this._config.refresh();
    } else {
      refreshToken = Observable.of(token);
    }

    responseObservable = refreshToken.flatMap(token => {
      if (!tokenNotExpired(null, token)) {
        if (this._config.noJwtError) {
          token = null;
        } else {
          return Observable.throw('Invalid JWT');
        }
      }
      if(typeof url === 'string') {
        let reqOpts = options || {};

        if(!reqOpts.headers) {
          reqOpts.headers = new Headers();
        }

        if (token) {
          reqOpts.headers.set(this._config.headerName, this._config.headerPrefix + token);
        }
        return this.http.request(url, reqOpts);
      } else {
        let req:Request = <Request>url;

        if(!req.headers) {
          req.headers = new Headers();
        }

        if (token) {
          req.headers.set(this._config.headerName, this._config.headerPrefix + token);
        }
        return this.http.request(req);
      }
    });

    return responseObservable;
  }

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions: RequestOptionsArgs) : Observable<Response> {
    let options = new RequestOptions(requestArgs);

    if(additionalOptions) {
      options = options.merge(additionalOptions)
    }

    return this.request(new Request(options))
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

    return decodeURIComponent(escape(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
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

export function tokenNotExpired(tokenName?:string, jwt?:string) {

  var authToken:string = tokenName || 'id_token';
  var token:string;

  if(jwt) {
    token = jwt;
  }
  else {
    token = localStorage.getItem(authToken);
  }

  var jwtHelper = new JwtHelper();

  if(!token || jwtHelper.isTokenExpired(token, null)) {
    return false;
  }

  else {
    return true;
  }
}
