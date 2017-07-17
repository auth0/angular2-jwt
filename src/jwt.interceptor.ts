import { Injectable, InjectionToken, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

export const JWT_OPTIONS = new InjectionToken('JWT_OPTIONS');

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: () => string;
  headerName: string;
  authScheme: string;
  whitelistedDomains: Array<string>;

  constructor(@Inject(JWT_OPTIONS) config: any) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || 'Authorization';
    this.authScheme = config.authScheme || 'Bearer ';
    this.whitelistedDomains = config.whitelistedDomains || [];
  }

  isWhitelistedDomain(request: HttpRequest<any>): boolean {
    const requestUrl: URL = new URL(request.url);
    return this.whitelistedDomains.indexOf(requestUrl.host) > -1;
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenGetter();

    if (token && this.isWhitelistedDomain(request)) {
      request = request.clone({
        setHeaders: {
          [this.headerName]: `${this.authScheme}${token}`
        }
      });
    }

    return next.handle(request);
  }
}
