import { HttpRequest } from '@angular/common/http';
// tslint:disable:no-bitwise

import { Injectable, Inject } from '@angular/core';
import { JWT_OPTIONS } from './jwtoptions.token';

@Injectable()
export class JwtHelperService {
  tokenGetter: () => string | Promise<string>;

  constructor(@Inject(JWT_OPTIONS) config = null) {
    this.tokenGetter = (config && config.tokenGetter) || function () {};
  }

  public urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: {
        break;
      }
      case 2: {
        output += '==';
        break;
      }
      case 3: {
        output += '=';
        break;
      }
      default: {
        throw new Error('Illegal base64url string!');
      }
    }
    return this.b64DecodeUnicode(output);
  }

  // credits for decoder goes to https://github.com/atk
  private b64decode(str: string): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    str = String(str).replace(/=+$/, '');

    if (str.length % 4 === 1) {
      throw new Error(
        `'atob' failed: The string to be decoded is not correctly encoded.`
      );
    }

    for (
      // initialize result and counters
      let bc = 0, bs: any, buffer: any, idx = 0;
      // get next character
      (buffer = str.charAt(idx++));
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer &&
      ((bs = bc % 4 ? bs * 64 + buffer : buffer),
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  }

  private b64DecodeUnicode(str: any) {
    return decodeURIComponent(
      Array.prototype.map
        .call(this.b64decode(str), (c: any) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }

  public decodeToken<T = any>(token: string): T | null;
  public decodeToken<T = any>(token: Promise<string>): Promise<T | null>;
  public decodeToken<T = any>(): null | T | Promise<T | null>;
  public decodeToken<T = any>(token?: string | Promise<string>): null | T | Promise<T | null> {
    // When token is passed as an empty string, we should not involve the tokenGetter.
    // Instead we should return null, the same way it did pre 5.1.1
    if (token === '') {
      return null;
    }

    const _token = token || this.tokenGetter();

    if (_token instanceof Promise) {
      return _token.then(t => this._decodeToken(t));
    }

    return this._decodeToken(_token);
  }

  private _decodeToken<T = any>(token: string): null | T  {
    if (!token || token === '') {
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error(
        `The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.`
      );
    }

    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('Cannot decode the token.');
    }

    return JSON.parse(decoded);
  }
  public getTokenExpirationDate(token: string): Date | null;
  public getTokenExpirationDate(token: Promise<string>): Promise<Date | null>;
  public getTokenExpirationDate(): null | Date | Promise<Date | null>;
  public getTokenExpirationDate(
    token?: string | Promise<string>
  ): Date | null | Promise<Date | null> {

    // When token is passed as an empty string, we should not involve the tokenGetter.
    // Instead we should return null, the same way it did pre 5.1.1
    if (token === '') {
      return null;
    }

    const _token = token || this.tokenGetter();

    if (_token instanceof Promise) {
      return _token.then(t => this._getTokenExpirationDate(t));
    }

    return this._getTokenExpirationDate(_token);
  }

  private _getTokenExpirationDate(token: string): Date | null {
    let decoded: any;
    decoded = this.decodeToken(token);

    if (!decoded || !decoded.hasOwnProperty('exp')) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  public isTokenExpired(token?: undefined | null, offsetSeconds?: number): boolean | Promise<boolean>;
  public isTokenExpired(token: string, offsetSeconds?: number): boolean;
  public isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
  public isTokenExpired(
    token?: string | Promise<string>,
    offsetSeconds?: number
  ): boolean | Promise<boolean> {
    // When token is passed as an empty string, we should not involve the tokenGetter.
    // Instead we should return true, the same way it did pre 5.1.1
    if (token === '') {
      return true;
    }

    const _token = token || this.tokenGetter();

    if (_token instanceof Promise) {
      return _token.then(t => this._isTokenExpired(t, offsetSeconds));
    }

    return this._isTokenExpired(_token, offsetSeconds);
  }

  public _isTokenExpired(
    token: string,
    offsetSeconds?: number
  ): boolean {
    if (!token || token === '') {
      return true;
    }
    const date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;

    if (date === null) {
      return false;
    }

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

  public getAuthScheme(
    authScheme: Function | string | undefined,
    request: HttpRequest<any>
  ): string {
    if (typeof authScheme === 'function') {
      return authScheme(request);
    }

    return authScheme;
  }
}
