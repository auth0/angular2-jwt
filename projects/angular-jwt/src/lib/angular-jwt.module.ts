import { NgModule, ModuleWithProviders, Optional, SkipSelf, Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {JwtInterceptor} from './jwt.interceptor';
import {JWT_OPTIONS} from './jwtoptions.token';
import {JwtHelperService} from './jwthelper.service';


export interface JwtModuleOptions {
  jwtOptionsProvider?: Provider;
  config?: {
    tokenGetter?: () => string | null | Promise<string | null>;
    headerName?: string;
    authScheme?: string;
    whitelistedDomains?: Array<string | RegExp>;
    blacklistedRoutes?: Array<string | RegExp>;
    throwNoTokenError?: boolean;
    skipWhenExpired?: boolean;
  };
}

@NgModule()
export class JwtModule {

  constructor(@Optional() @SkipSelf() parentModule: JwtModule) {
    if (parentModule) {
      throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
    }
  }
  static forRoot(options: JwtModuleOptions): ModuleWithProviders<JwtModule> {
    return {
      ngModule: JwtModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        },
        options.jwtOptionsProvider ||
        {
          provide: JWT_OPTIONS,
          useValue: options.config
        },
        JwtHelperService
      ]
    };
  }
}
