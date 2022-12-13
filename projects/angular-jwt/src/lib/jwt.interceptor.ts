import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { JwtHelperService } from './jwthelper.service';
import { JWT_OPTIONS } from './jwtoptions.token';

import { map, mergeMap } from 'rxjs/operators';
import { defer, from, Observable, of } from 'rxjs';

const fromPromiseOrValue = <T>(input: T | Promise<T>) => {
  if (input instanceof Promise) {
    return defer(() => input);
  }
  return of(input);
};
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: (
    request?: HttpRequest<any>
  ) => string | null | Promise<string | null>;
  headerName: string;
  authScheme: string | ((request?: HttpRequest<any>) => string);
  allowedDomains: Array<string | RegExp>;
  disallowedRoutes: Array<string | RegExp>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;
  standardPorts: string[] = ['80', '443'];

  constructor(
    @Inject(JWT_OPTIONS) config: any,
    public jwtHelper: JwtHelperService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || 'Authorization';
    this.authScheme =
      config.authScheme || config.authScheme === ''
        ? config.authScheme
        : 'Bearer ';
    this.allowedDomains = config.allowedDomains || [];
    this.disallowedRoutes = config.disallowedRoutes || [];
    this.throwNoTokenError = config.throwNoTokenError || false;
    this.skipWhenExpired = config.skipWhenExpired;
  }

  isAllowedDomain(request: HttpRequest<any>): boolean {
    const requestUrl: URL = new URL(request.url, this.document.location.origin);

    // If the host equals the current window origin,
    // the domain is allowed by default
    if (requestUrl.host === this.document.location.host) {
      return true;
    }

    // If not the current domain, check the allowed list
    const hostName = `${requestUrl.hostname}${
      requestUrl.port && !this.standardPorts.includes(requestUrl.port)
        ? ':' + requestUrl.port
        : ''
    }`;

    return (
      this.allowedDomains.findIndex((domain) =>
        typeof domain === 'string'
          ? domain === hostName
          : domain instanceof RegExp
          ? domain.test(hostName)
          : false
      ) > -1
    );
  }

  isDisallowedRoute(request: HttpRequest<any>): boolean {
    const requestedUrl: URL = new URL(
      request.url,
      this.document.location.origin
    );

    return (
      this.disallowedRoutes.findIndex((route: string | RegExp) => {
        if (typeof route === 'string') {
          const parsedRoute: URL = new URL(
            route,
            this.document.location.origin
          );
          return (
            parsedRoute.hostname === requestedUrl.hostname &&
            parsedRoute.pathname === requestedUrl.pathname
          );
        }

        if (route instanceof RegExp) {
          return route.test(request.url);
        }

        return false;
      }) > -1
    );
  }

  handleInterception(
    token: string | null,
    request: HttpRequest<any>,
    next: HttpHandler
  ) {
    const authScheme = this.jwtHelper.getAuthScheme(this.authScheme, request);

    if (!token && this.throwNoTokenError) {
      throw new Error('Could not get token from tokenGetter function.');
    }

    let tokenIsExpired = of(false);

    if (this.skipWhenExpired) {
      tokenIsExpired = token ? fromPromiseOrValue(this.jwtHelper.isTokenExpired(token)) : of(true);
    }

    if (token) {
      return tokenIsExpired.pipe(
        map((isExpired) =>
          isExpired && this.skipWhenExpired
            ? request.clone()
            : request.clone({
                setHeaders: {
                  [this.headerName]: `${authScheme}${token}`,
                },
              })
        ),
        mergeMap((innerRequest) => next.handle(innerRequest))
      );
    }

    return next.handle(request);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
      return next.handle(request);
    }
    const token = this.tokenGetter(request);

    return fromPromiseOrValue(token).pipe(
      mergeMap((asyncToken: string | null) => {
        return this.handleInterception(asyncToken, request, next);
      })
    );
  }
}
