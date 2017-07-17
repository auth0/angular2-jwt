import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { JwtInterceptor } from './src/jwt.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWT_OPTIONS } from './src/jwt.interceptor';

export * from './src/jwt.interceptor';

export interface JwtModuleOptions {
  config: {
    tokenGetter: () => string;
    headerName?: string;
    tokenName?: string;
    whitelistedDomains: Array<string>;
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
        {
          provide: JWT_OPTIONS,
          useValue: options.config
        }
      ]
    };
  }
}
