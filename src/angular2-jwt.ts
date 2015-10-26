import {Injectable} from 'angular2/angular2';
import {Http, Headers, BaseRequestOptions, Request, RequestOptions, RequestOptionsArgs, RequestMethods} from 'angular2/http';

/**
 * Sets up the authentication configuration.
 *
 */

class AuthConfig {
  
  private _headerName: string;
  private _headerPrefix: string;
  private _tokenName: string;
  private _jwt: string;

  constructor(config:Object) {
    this.config = config || {};
    this._headerName = this.config.headerName || 'Authorization';
    this._headerPrefix = this.config.headerPrefix || 'Bearer ';
    this._tokenName = this.config.tokenName || 'id_token';
    this._jwt = localStorage.getItem(this._tokenName);

    return {
      headerName: this._headerName,
      headerPrefix: this._headerPrefix,
      tokenName: this._tokenName,
      jwt: this._jwt
    }
  }
}

/**
 * Extends BaseRequestOptions and provides it with an authentication header.
 *
 */

export class AuthRequestOptions extends BaseRequestOptions {
  
  private _config: AuthConfig;
  private _authHeader: Headers = new Headers();
  jwt: string;

  constructor(public config:object) {
    super();

    this._config = new AuthConfig(config);

    this._authHeader.append(
      this._config.headerName,
      this._config.headerPrefix + this._config.jwt
    );   

  }

  headers: Headers = this._authHeader;
}

/**
 * Allows for explicit authenticated HTTP requests.
 * WIP - need to add proper config
 */

@Injectable()
export class AuthHttp {

  authHeader: Headers = new Headers();
  private _headerName: string;
  private _headerPrefix: string;
  private _tokenName: string;
  private _jwt: string;

  constructor(public http:Http) {
    this._headerName = 'Authorization';
    this._headerPrefix = 'Bearer ';
    this._tokenName = 'id_token';
    this._jwt = localStorage.getItem(this._tokenName);
    this.authHeader.append(this._headerName, this._headerPrefix + this._jwt);
  }

  request(method:RequestMethods, url:string, body?:string) {
    return this.http.request(new Request({
      method: method,
      url: url,
      body: body,
      headers: this.authHeader
    })); 
  }

  get(url:string) {
    return this.request(RequestMethods.Get, url);
  }

  post(url:string, body:string) {
    return this.request(RequestMethods.Post, url, body);
  }

  put(url:string, body:string) {
    return this.request(RequestMethods.Put, url, body);
  }

  delete(url:string, body?:string) {
    return this.request(RequestMethods.Delete, url, body);
  }

  options(url:string, body?:string) {
    return this.request(RequestMethods.Options, url, body);
  }

  head(url:string, body?:string) {
    return this.request(RequestMethods.Head, url, body);
  }

  patch(url:string, body:string) {
    return this.request(RequestMethods.Patch, url, body);
  }
  
}


/**
 * Helper class to decode and find JWT expiration.
 *
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

  public decodeToken(token) {
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

  public getTokenExpirationDate(token) {
    var decoded;
    decoded = this.decodeToken(token);

    if(typeof decoded.exp === "undefined") {
      return null;
    }

    var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  public isTokenExpired(token, offsetSeconds) {
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
 * For use with the @CanActivate router decorator.
 */

export class AuthStatus {

  public static tokenNotExpired(tokenName?:string) {

    this.tokenName = tokenName || 'id_token';
    this.token = localStorage.getItem(this.tokenName);
    var jwtHelper = new JwtHelper();

    if(!this.token) {
      throw 'No token saved!';
    }
    
    if(jwtHelper.isTokenExpired(this.token)) {
      return false;
    }

    else {
      return true;
    }
  }
}

/**
 * WIP example of a manual HTTP interceptor.
 * 
 */

export function intercept() {

  declare private _open = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {

    this.addEventListener("readystatechange", function() {
      if(this.readyState == 1) {
        this.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('id_token'));
      }          
    }, false);

    _open.call(this, method, url, async, user, pass);
  }
}

