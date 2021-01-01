import { HttpRequest } from "@angular/common/http";
// tslint:disable:no-bitwise
import { Inject, Injectable } from "@angular/core";
import { JWT_OPTIONS } from "./jwtoptions.token";

@Injectable()
export class JwtHelperService {
  tokenGetter: () => string | Promise<string>;

  constructor(@Inject(JWT_OPTIONS) config = null) {
    this.tokenGetter = (config && config.tokenGetter) || function () {};
  }

  public urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0: {
        break;
      }
      case 2: {
        output += "==";
        break;
      }
      case 3: {
        output += "=";
        break;
      }
      default: {
        throw new Error("Illegal base64url string!");
      }
    }
    return this.b64DecodeUnicode(output);
  }

  // credits for decoder goes to https://github.com/atk
  private b64decode(str: string): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";

    str = String(str).replace(/=+$/, "");

    if (str.length % 4 === 1) {
      throw new Error(
        "'atob' failed: The string to be decoded is not correctly encoded."
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
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  public decodeToken(
    token: string | Promise<string> = this.tokenGetter()
  ): any | Promise<any> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) => this._decodeToken(tokenValue));
    }

    if (!token || token === "") {
      return null;
    }

    return this._decodeToken(token);
  }

  public getTokenExpirationDate(
    token: string | Promise<string> = this.tokenGetter()
  ): Date | null | Promise<Date | null> {
    let decoded: any | Promise<any> = this.decodeToken(token);
    if (decoded instanceof Promise) {
      return decoded.then((tokenValue) =>
        this._getTokenExpirationDate(tokenValue)
      );
    }

    return this._getTokenExpirationDate(decoded);
  }

  public isTokenExpired(
    token: string | Promise<string> = this.tokenGetter(),
    offsetSeconds?: number
  ): boolean | Promise<boolean> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) =>
        this.isTokenExpired(tokenValue, offsetSeconds)
      );
    }

    if (!token || token === "") {
      return true;
    }

    return this._isTokenExpired(token, offsetSeconds);
  }

  public getAuthScheme(
    authScheme: Function | string | undefined,
    request: HttpRequest<any>
  ): string {
    if (typeof authScheme === "function") {
      return authScheme(request);
    }

    return authScheme;
  }

  private _decodeToken(tokenValue: string) {
    const parts = tokenValue.split(".");

    if (parts.length !== 3) {
      throw new Error(
        "The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more."
      );
    }

    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error("Cannot decode the token.");
    }

    return JSON.parse(decoded);
  }

  private _getTokenExpirationDate(decoded: any): Date | null {
    if (!decoded || !decoded.hasOwnProperty("exp")) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return date;
  }

  private _isTokenExpired(token: string, offsetSeconds: number = 0): boolean {
    const date = this.getTokenExpirationDate(token);

    if (date === null) {
      return false;
    }

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }
}
