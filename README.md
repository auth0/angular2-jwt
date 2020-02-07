# @avatsaev/angular-jwt

[![npm version](https://badge.fury.io/js/%40avatsaev%2Fangular-jwt.svg)](https://badge.fury.io/js/%40avatsaev%2Fangular-jwt)

## Installation

```bash
# installation with npm
npm install @avatsaev/angular-jwt

# installation with yarn
yarn add @avatsaev/angular-jwt
```

## Usage: Standalone

If you are only interested in the JWT Decoder, and are not interested in extended
injectable features, you can simply create an instance of the utility and use it
directly:

```ts
import { JwtHelperService } from "@avatsaev/angular-jwt";

const helper = new JwtHelperService();

const decodedToken = helper.decodeToken(myRawToken);
const expirationDate = helper.getTokenExpirationDate(myRawToken);
const isExpired = helper.isTokenExpired(myRawToken);
```

## Usage: Injection

Import the `JwtModule` module and add it to your imports list. Call the `forRoot` method and provide a `tokenGetter` function. You must also whitelist any domains that you want to make requests to by specifying a `whitelistedDomains` array.

Be sure to import the `HttpClientModule` as well.

```ts
import { JwtModule } from "@avatsaev/angular-jwt";
import { HttpClientModule } from "@angular/common/http";

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    // ...
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ["example.com"],
        blacklistedRoutes: ["example.com/examplebadroute/"]
      }
    })
  ]
})
export class AppModule {}
```

Any requests sent using Angular's `HttpClient` will automatically have a token attached as an `Authorization` header.

```ts
import { HttpClient } from "@angular/common/http";

export class AppComponent {
  constructor(public http: HttpClient) {}

  ping() {
    this.http
      .get("http://example.com/api/things")
      .subscribe(data => console.log(data), err => console.log(err));
  }
}
```

## Configuration Options

### `tokenGetter: function`

The `tokenGetter` is a function which returns the user's token. This function simply needs to make a retrieval call to wherever the token is stored. In many cases, the token will be stored in local storage or session storage.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    tokenGetter: () => {
      return localStorage.getItem("access_token");
    }
  }
});
```

### `whitelistedDomains: array`

Authenticated requests should only be sent to domains you know and trust. Many applications make requests to APIs from multiple domains, some of which are not controlled by the developer. Since there is no way to know what the API being called will do with the information contained in the request, it is best to not send the user's token to all APIs in a blind fashion.

List any domains you wish to allow authenticated requests to be sent to by specifying them in the the `whitelistedDomains` array. **Note that standard http port 80 and https port 443 requests don't require a port to be specified. A port is only required in the whitelisted host name if you are authenticating against a non-standard port e.g. localhost:3001**

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    whitelistedDomains: ["localhost:3001", "foo.com", "bar.com"]
  }
});
```

### `blacklistedRoutes: array`

If you do not want to replace the authorization headers for specific routes, list them here. This can be useful if your
initial auth route(s) are on a whitelisted domain and take basic auth headers.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    blacklistedRoutes: [
      "localhost:3001/auth/",
      "foo.com/bar/",
      /localhost:3001\/foo\/far.*/
    ] // strings and regular expressions
  }
});
```

**Note:** If requests are sent to the same domain that is serving your Angular application, you do not need to add that domain to the `whitelistedDomains` array. However, this is only the case if you don't specify the domain in the `Http` request.

For example, the following request assumes that the domain is the same as the one serving your app. It doesn't need to be whitelisted in this case.

```ts
this.http.get('/api/things')
  .subscribe(...)
```

However, if you are serving your API at the same domain as that which is serving your Angular app **and** you are specifying that domain in `Http` requests, then it **does** need to be whitelisted.

```ts
// Both the Angular app and the API are served at
// localhost:4200 but because that domain is specified
// in the request, it must be whitelisted
this.http.get('http://localhost:4200/api/things')
  .subscribe(...)
```

### `headerName: string`

The default header name is `Authorization`. This can be changed by specifying a custom `headerName` which is to be a string value.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    headerName: "Your Header Name"
  }
});
```

### `authScheme: string`

The default authorization scheme is `Bearer` followed by a single space. This can be changed by specifying a custom `authScheme` which is to be a string.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    authScheme: "Your Auth Scheme"
  }
});
```

### `throwNoTokenError: boolean`

Setting `throwNoTokenError` to `true` will result in an error being thrown if a token cannot be retrieved with the `tokenGetter` function. Defaults to `false`.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    throwNoTokenError: true
  }
});
```

### `skipWhenExpired: boolean`

By default, the user's JWT will be sent in `HttpClient` requests even if it is expired. You may choose to not allow the token to be sent if it is expired by setting `skipWhenExpired` to true.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    skipWhenExpired: true
  }
});
```

## Using a Custom Options Factory Function

In some cases, you may need to provide a custom factory function to properly handle your configuration options. This is the case if your `tokenGetter` function relies on a service or if you are using an asynchronous storage mechanism (like Ionic's `Storage`).

Import the `JWT_OPTIONS` `InjectionToken` so that you can instruct it to use your custom factory function.

Create a factory function and specify the options as you normally would if you were using `JwtModule.forRoot` directly. If you need to use a service in the function, list it as a parameter in the function and pass it in the `deps` array when you provide the function.

```ts
import { JwtModule, JWT_OPTIONS } from '@avatsaev/angular-jwt';
import { TokenService } from './app.tokenservice';

// ...

export function jwtOptionsFactory(tokenService) {
  return {
    tokenGetter: () => {
      return tokenService.getAsyncToken();
    }
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

NOTE: If a `jwtOptionsFactory` is defined, then `config` is ignored. _Both configuration alternatives can't be defined at the same time_.

## Configuration for Ionic 2+

The custom factory function approach described above can be used to get a token asynchronously with Ionic's `Storage`.

```ts
import { JwtModule, JWT_OPTIONS } from '@avatsaev/angular-jwt';
import { Storage } from '@ionic/storage';

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get('access_token');
    }
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

## Configuration Options

### `JwtHelperService: service`

This service contains helper functions:

## isTokenExpired (old tokenNotExpired function)

```
import { JwtHelperService } from '@avatsaev/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
console.log(this.jwtHelper.isTokenExpired()); // true or false
}
```

## getTokenExpirationDate

```
import { JwtHelperService } from '@avatsaev/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
console.log(this.jwtHelper.getTokenExpirationDate()); // date
}
```

## decodeToken

```
import { JwtHelperService } from '@avatsaev/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
console.log(this.jwtHelper.decodeToken(token)); // token
}
```

## Author

[Aslan Vatsaev](https://github.com/avatsaev)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
