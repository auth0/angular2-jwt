import { NgModule, ModuleWithProviders } from '@angular/core';
import { JwtInterceptor } from './src/jwt.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWT_OPTIONS } from './src/jwt.interceptor';

export * from './src/jwt.interceptor';

export interface JwtModuleOptions {
  config: {
    tokenGetter: any,
    headerName?: string,
    tokenName?: string
  }
}

@NgModule()
export class JwtModule {
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
