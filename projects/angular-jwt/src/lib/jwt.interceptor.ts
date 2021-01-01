import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { parse } from "url";
import { JwtHelperService } from "./jwthelper.service";
import { JWT_OPTIONS } from "./jwtoptions.token";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: (
    request?: HttpRequest<any>
  ) => string | null | Promise<string | null>;
  headerName: string;
  authScheme: string | ((request?: HttpRequest<any>) => string);
  whitelistedDomains: Array<string | RegExp>;
  blacklistedRoutes: Array<string | RegExp>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;
  standardPorts: string[] = ["80", "443"];

  constructor(
    @Inject(JWT_OPTIONS) config: any,
    public jwtHelper: JwtHelperService
  ) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || "Authorization";
    this.authScheme =
      config.authScheme || config.authScheme === ""
        ? config.authScheme
        : "Bearer ";
    this.whitelistedDomains = config.whitelistedDomains || [];
    this.blacklistedRoutes = config.blacklistedRoutes || [];
    this.throwNoTokenError = config.throwNoTokenError || false;
    this.skipWhenExpired = config.skipWhenExpired;
  }

  isWhitelistedDomain(request: HttpRequest<any>): boolean {
    const requestUrl: any = parse(request.url, false, true);
    const hostName =
      requestUrl.hostname !== null
        ? `${requestUrl.hostname}${
            requestUrl.port && !this.standardPorts.includes(requestUrl.port)
              ? ":" + requestUrl.port
              : ""
          }`
        : requestUrl.hostname;

    return (
      hostName === null ||
      this.whitelistedDomains.findIndex((domain) =>
        typeof domain === "string"
          ? domain === hostName
          : domain instanceof RegExp
          ? domain.test(hostName)
          : false
      ) > -1
    );
  }

  isBlacklistedRoute(request: HttpRequest<any>): boolean {
    const requestedUrl = parse(request.url, false, true);

    return (
      this.blacklistedRoutes.findIndex((route: string | RegExp) => {
        if (typeof route === "string") {
          const parsedRoute = parse(route, false, true);
          return (
            parsedRoute.hostname === requestedUrl.hostname &&
            parsedRoute.path === requestedUrl.path
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
    token: string | Promise<string> | null,
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authScheme = this.jwtHelper.getAuthScheme(this.authScheme, request);

    if (!token && this.throwNoTokenError) {
      throw new Error("Could not get token from tokenGetter function.");
    }

    return from(Promise.resolve(token)).pipe(
      mergeMap<string, Observable<HttpEvent<any>>>((tokenValue: string) => {
        let tokenIsExpired = false;

        if (this.skipWhenExpired) {
          tokenIsExpired = token
            ? (this.jwtHelper.isTokenExpired(tokenValue) as boolean)
            : true;
        }

        if (tokenValue && tokenIsExpired && this.skipWhenExpired) {
          request = request.clone();
        } else if (tokenValue) {
          request = request.clone({
            setHeaders: {
              [this.headerName]: `${authScheme}${tokenValue}`,
            },
          });
        }
        return next.handle(request);
      })
    );
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !this.isWhitelistedDomain(request) ||
      this.isBlacklistedRoute(request)
    ) {
      return next.handle(request);
    }
    const token = this.tokenGetter(request);

    if (token instanceof Promise) {
      return from(token).pipe(
        mergeMap((asyncToken: string | null) => {
          return this.handleInterception(asyncToken, request, next);
        })
      );
    } else {
      return this.handleInterception(token, request, next);
    }
  }
}
