import { NgModule, ModuleWithProviders, Optional, SkipSelf, Provider } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { JwtInterceptor } from './src/jwt.interceptor';
import { JwtHelperService } from './src/jwthelper.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWT_OPTIONS } from './src/jwtoptions.token';

export * from './src/jwt.interceptor';
export * from './src/jwthelper.service';
export * from './src/jwtoptions.token';

export interface JwtModuleOptions {
  jwtOptionsProvider?: Provider,
  config?: {
    tokenGetter?: () => string | Promise<string> | Observable<string>;
    headerName?: string;
    authScheme?: string;
    whitelistedDomains?: Array<string | RegExp>;
    throwNoTokenError?: boolean;
    skipWhenExpired?: boolean;
  }
}

@NgModule()
export class JwtModule {

  constructor(@Optional() @SkipSelf() parentModule: JwtModule) {
    if (parentModule) {
      throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
    }
  }
  static forRoot(options: JwtModuleOptions): ModuleWithProviders {
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
