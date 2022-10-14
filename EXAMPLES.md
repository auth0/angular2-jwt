
- [Using a Custom Options Factory Function](#using-a-custom-options-factory-function)
- [Configuration for Ionic 2+](#configuration-for-ionic-2)

## Using a Custom Options Factory Function

In some cases, you may need to provide a custom factory function to properly handle your configuration options. This is the case if your `tokenGetter` function relies on a service or if you are using an asynchronous storage mechanism (like Ionic's `Storage`).

Import the `JWT_OPTIONS` `InjectionToken` so that you can instruct it to use your custom factory function.

Create a factory function and specify the options as you normally would if you were using `JwtModule.forRoot` directly. If you need to use a service in the function, list it as a parameter in the function and pass it in the `deps` array when you provide the function.

```ts
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { TokenService } from './app.tokenservice';

// ...

export function jwtOptionsFactory(tokenService) {
  return {
    tokenGetter: () => {
      return tokenService.getAsyncToken();
    },
    allowedDomains: ["example.com"]
  }
}

// ...

@NgModule({
  // ...
  imports: [
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [TokenService]
      }
    })
  ],
  providers: [TokenService]
})
```

**Note:**: If a `jwtOptionsFactory` is defined, then `config` is ignored. _Both configuration alternatives can't be defined at the same time_.

## Configuration for Ionic 2+

The custom factory function approach described above can be used to get a token asynchronously with Ionic's `Storage`.

```ts
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get('access_token');
    },
    allowedDomains: ["example.com"]
  }
}

// ...

@NgModule({
  // ...
  imports: [
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    })
  ]
})
```

**Note:**: If a `jwtOptionsFactory` is defined, then `config` is ignored. _Both configuration alternatives can't be defined at the same time_.
