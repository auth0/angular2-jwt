import { NgModule, ModuleWithProviders, Provider, SkipSelf, Optional, Inject, InjectionToken } from '@angular/core';
import { JwtInterceptor } from './src/jwt.interceptor';
import { JwtHelperService } from './src/jwthelper.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JWT_OPTIONS } from './src/jwtoptions.token';

export * from './src/jwt.interceptor';
export * from './src/jwthelper.service';
export * from './src/jwtoptions.token';

export const ROUTER_FORROOT_GUARD = new InjectionToken<void>('ROUTER_FORROOT_GUARD');

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

export function provideForRootGuard(jwtModule: JwtModule): any {
    if (jwtModule) {
        throw new Error(`JwtModule.forRoot() called twice. Lazy loaded modules should use JwtModule.forChild() instead.`);
    }
    return 'guarded';
}

@NgModule()
export class JwtModule {

    constructor(@Optional() @Inject(ROUTER_FORROOT_GUARD) guard: any, @Optional() jwtModule: JwtModule) {}


    static forRoot(options: JwtModuleOptions): ModuleWithProviders {
        return {
            ngModule: JwtModule,
            providers: [
                {
                    provide: ROUTER_FORROOT_GUARD,
                    useFactory: provideForRootGuard,
                    deps: [[JwtModule, new Optional(), new SkipSelf()]]
                },
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
                JwtHelperService,
            ]
        };
    }

    static forChild(): ModuleWithProviders {
        return {
            ngModule: JwtModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                }
            ]
        };
    }
}
