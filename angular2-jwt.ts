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
  noJwtError: boolean;
  customHeaders?: Headers;
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
  noJwtError: boolean;
  customHeaders: Headers;

  constructor(config?:any) {
    this.config = config || {};
    this.headerName = this.config.headerName || 'Authorization';
    this.headerPrefix = this.config.headerPrefix || 'Bearer ';
    this.tokenName = this.config.tokenName || 'id_token';
    this.noJwtError = this.config.noJwtError || false;
    this.tokenGetter = this.config.tokenGetter || (() => localStorage.getItem(this.tokenName));
    this.customHeaders = this.config.customHeaders ? new Headers(this.config.customHeaders) : new Headers({'Content-Type': 'application/json'});
  }

  getConfig() {
    return {
      headerName: this.headerName,
      headerPrefix: this.headerPrefix,
      tokenName: this.tokenName,
      tokenGetter: this.tokenGetter,
      noJwtError: this.noJwtError,
      customHeaders: this.customHeaders
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
  http: Http;

  constructor(config?:Object) {
    this._config = new AuthConfig(config).getConfig();
    var injector = Injector.resolveAndCreate([HTTP_PROVIDERS]);
    this.http = injector.get(Http);

    this.tokenStream = new Observable((obs:any) => {
      obs.next(this._config.tokenGetter())
    });
  }

  request(method:RequestMethod, url:string, body?:string) {

    var allHeaders = new Headers();

    this._config.customHeaders.forEach((values, name, headers) => {
      var value = this._config.customHeaders.get(name);
      allHeaders.append(name, value);
    });

    var options = new RequestOptions({
      method: method,
      url: url,
      body: body,
      headers: allHeaders
    });

    if(!tokenNotExpired(null, this._config.tokenGetter())) {
      if(this._config.noJwtError) {
        return this.http.request(new Request(options));
      }

      throw 'Invalid JWT';
    }

    allHeaders.append(this._config.headerName, this._config.headerPrefix + this._config.tokenGetter());

    var authOptions = new RequestOptions({
      method: method,
      url: url,
      body: body,
      headers: allHeaders
    });

    return this.http.request(new Request(authOptions));

  }

  get(url:string) : Observable<Response> {
    return this.request(RequestMethod.Get, url, null);
  }

  post(url:string, body:string) : Observable<Response> {
    return this.request(RequestMethod.Post, url, body);
  }

  put(url:string, body:string) : Observable<Response> {
    return this.request(RequestMethod.Put, url, body);
  }

  delete(url:string, body?:string) : Observable<Response> {
    return this.request(RequestMethod.Delete, url, body);
  }

  options(url:string, body?:string) : Observable<Response> {
    return this.request(RequestMethod.Options, url, body);
  }

  head(url:string, body?:string) : Observable<Response> {
    return this.request(RequestMethod.Head, url, body);
  }

  patch(url:string, body:string) : Observable<Response> {
    return this.request(RequestMethod.Patch, url, body);
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
