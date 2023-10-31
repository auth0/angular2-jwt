import { HttpRequest } from '@angular/common/http';
/* eslint-disable no-bitwise */

import { Injectable, Inject } from '@angular/core';
import { JWT_OPTIONS } from './jwtoptions.token';

@Injectable()
export class JwtHelperService {
  tokenGetter: () => string | Promise<string>;

  constructor(@Inject(JWT_OPTIONS) config: any = null) {
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
  public decodeToken<T = any>(token: string | Promise<string> = this.tokenGetter()): null | T | Promise<T | null> {
    if (token instanceof Promise) {
      return token.then(t => this._decodeToken(t));
    }

    return this._decodeToken(token);
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
    token: string | Promise<string> = this.tokenGetter()
  ): Date | null | Promise<Date | null> {
    if (token instanceof Promise) {
      return token.then(t => this._getTokenExpirationDate(t));
    }

    return this._getTokenExpirationDate(token);
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

  public isTokenExpired(token?: undefined, offsetSeconds?: number): boolean | Promise<boolean>;
  public isTokenExpired(token: string | null, offsetSeconds?: number): boolean;
  public isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
  public isTokenExpired(
    token: undefined | null | string | Promise<string> = this.tokenGetter(),
    offsetSeconds?: number
  ): boolean | Promise<boolean> {
    if (token instanceof Promise) {
      return token.then(t => this._isTokenExpired(t, offsetSeconds));
    }

    return this._isTokenExpired(token, offsetSeconds);
  }

  private _isTokenExpired(
    token: string | null,
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
  ): string | undefined {
    if (typeof authScheme === 'function') {
      return authScheme(request);
    }

    return authScheme;
  }
}
