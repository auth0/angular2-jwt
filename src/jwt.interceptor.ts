import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { JwtHelperService } from './jwthelper.service';
import { JWT_OPTIONS } from './jwtoptions.token';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: () => string;
  headerName: string;
  authScheme: string;
  whitelistedDomains: Array<string>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;

  constructor(
    @Inject(JWT_OPTIONS) config: any,
    public jwtHelper: JwtHelperService
  ) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || 'Authorization';
    this.authScheme = config.authScheme || 'Bearer ';
    this.whitelistedDomains = config.whitelistedDomains || [];
    this.throwNoTokenError = config.throwNoTokenError || false;
    this.skipWhenExpired = config.skipWhenExpired;
  }

  isWhitelistedDomain(request: HttpRequest<any>): boolean {
    let requestUrl: URL;
    try {
      requestUrl = new URL(request.url);
      return this.whitelistedDomains.indexOf(requestUrl.host) > -1;
    } catch (err) {
      // if we're here, the request is made
      // to the same domain as the Angular app
      // so it's safe to proceed
      return true;
    }
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenGetter();
    let tokenIsExpired;

    if (!token && this.throwNoTokenError) {
      throw new Error('Could not get token from tokenGetter function.');
    }

    if (this.skipWhenExpired) {
      tokenIsExpired = token ? this.jwtHelper.isTokenExpired() : true;
    }

    if (
      token &&
      tokenIsExpired &&
      this.skipWhenExpired
    ) {
      request = request.clone();
    } else if (token && this.isWhitelistedDomain(request)) {
      request = request.clone({
        setHeaders: {
          [this.headerName]: `${this.authScheme}${token}`
        }
      });
    }
    return next.handle(request);
  }
}
