import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { JwtHelperService } from './jwthelper.service';
import { JWT_OPTIONS } from './jwtoptions.token';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: () => string | Promise<string>;
  headerName: string;
  authScheme: string;
  whitelistedDomains: Array<string | RegExp>;
  blacklistedRoutes: Array<string | RegExp>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;

  constructor(
    @Inject(JWT_OPTIONS) config: any,
    public jwtHelper: JwtHelperService
  ) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || 'Authorization';
    this.authScheme =
      config.authScheme || config.authScheme === ''
        ? config.authScheme
        : 'Bearer ';
    this.whitelistedDomains = config.whitelistedDomains || [];
    this.blacklistedRoutes = config.blacklistedRoutes || [];
    this.throwNoTokenError = config.throwNoTokenError || false;
    this.skipWhenExpired = config.skipWhenExpired;
  }

  isWhitelistedDomain(request: HttpRequest<any>): boolean {
    const requestUrl = new URL(request.url,'http://127.0.0.1:8080');

    return (
      this.whitelistedDomains.findIndex(
        domain =>
          typeof domain === 'string'
            ? domain === requestUrl.host
            : domain instanceof RegExp ? domain.test(requestUrl.host) : false
      ) > -1
    );
  }

  isBlacklistedRoute(request: HttpRequest<any>): boolean {
      const url = request.url;

      return (
          this.blacklistedRoutes.findIndex(
              route =>
                  typeof route === 'string'
                      ? route === url
                      : route instanceof RegExp ? route.test(url) : false
          ) > -1
      );
  }


    handleInterception(
    token: string,
    request: HttpRequest<any>,
    next: HttpHandler
  ) {
    let tokenIsExpired: boolean;

    if (!token && this.throwNoTokenError) {
      throw new Error('Could not get token from tokenGetter function.');
    }

    if (this.skipWhenExpired) {
      tokenIsExpired = token ? this.jwtHelper.isTokenExpired(token) : true;
    }

    if (token && tokenIsExpired && this.skipWhenExpired) {
      request = request.clone();
    } else if (token && this.isWhitelistedDomain(request) && !this.isBlacklistedRoute(request)) {
      request = request.clone({
        setHeaders: {
          [this.headerName]: `${this.authScheme}${token}`
        }
      });
    }
    return next.handle(request);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: any = this.tokenGetter();

    if (token instanceof Promise) {
      return Observable.fromPromise(token).mergeMap((asyncToken: string) => {
        return this.handleInterception(asyncToken, request, next);
      });
    } else {
      return this.handleInterception(token, request, next);
    }
  }
}
