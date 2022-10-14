# @auth0/angular-jwt

![Release](https://img.shields.io/github/v/release/auth0/angular2-jwt)
![Downloads](https://img.shields.io/npm/dw/@auth0/angular-jwt)
[![License](https://img.shields.io/:license-MIT-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
[![CircleCI](https://img.shields.io/circleci/build/github/auth0/angular2-jwt)](https://circleci.com/gh/auth0/angular2-jwt)

:books: [Documentation](#documentation) - :rocket: [Getting Started](#getting-started) - :computer: [API Reference](#api-reference) - :speech_balloon: [Feedback](#feedback)

## Documentation

- [Examples](./EXAMPLES.md) - code samples for common angular-jwt authentication scenario's.
- [Docs site](https://www.auth0.com/docs) - explore our docs site and learn more about Auth0.

This library provides an `HttpInterceptor` which automatically attaches a [JSON Web Token](https://jwt.io) to `HttpClient` requests.

This library does not have any functionality for (or opinion about) implementing user authentication and retrieving JWTs to begin with. Those details will vary depending on your setup, but in most cases, you will use a regular HTTP request to authenticate your users and then save their JWTs in local storage or in a cookie if successful.

## Getting started
### Requirements
This project only supports the [actively supported versions of Angular as stated in the Angular documentation](https://angular.io/guide/releases#actively-supported-versions). Whilst other versions might be compatible they are not actively supported

### Installation

```bash
# installation with npm
npm install @auth0/angular-jwt

# installation with yarn
yarn add @auth0/angular-jwt
```

## Configure the SDK

Import the `JwtModule` module and add it to your imports list. Call the `forRoot` method and provide a `tokenGetter` function. You must also add any domains to the `allowedDomains`, that you want to make requests to by specifying an `allowedDomains` array.

Be sure to import the `HttpClientModule` as well.

```ts
import { JwtModule } from "@auth0/angular-jwt";
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
        allowedDomains: ["example.com"],
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),
  ],
})
export class AppModule {}
```

Any requests sent using Angular's `HttpClient` will automatically have a token attached as an `Authorization` header.

```ts
import { HttpClient } from "@angular/common/http";

export class AppComponent {
  constructor(public http: HttpClient) {}

  ping() {
    this.http.get("http://example.com/api/things").subscribe(
      (data) => console.log(data),
      (err) => console.log(err)
    );
  }
}
```

## API reference

- [JwtModule configuration options](#jwtmodule-configuration-options)
- [JwtHelperService](#jwthelperservice)

### `JwtModule` configuration options

#### `tokenGetter: function(HttpRequest): string`

The `tokenGetter` is a function which returns the user's token. This function simply needs to make a retrieval call to wherever the token is stored. In many cases, the token will be stored in local storage or session storage.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    tokenGetter: () => {
      return localStorage.getItem("access_token");
    },
  },
});
```

If you have multiple tokens for multiple domains, you can use the `HttpRequest` passed to the `tokenGetter` function to get the correct token for each intercepted request.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    tokenGetter: (request) => {
      if (request.url.includes("foo")) {
        return localStorage.getItem("access_token_foo");
      }

      return localStorage.getItem("access_token");
    },
  },
});
```

#### `allowedDomains: array`

Authenticated requests should only be sent to domains you know and trust. Many applications make requests to APIs from multiple domains, some of which are not controlled by the developer. Since there is no way to know what the API being called will do with the information contained in the request, it is best to not send the user's token to all APIs in a blind fashion.

List any domains you wish to allow authenticated requests to be sent to by specifying them in the `allowedDomains` array. **Note that standard http port 80 and https port 443 requests don't require a port to be specified. A port is only required in the allowed domains host name if you are authenticating against a non-standard port e.g. localhost:3001**

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    allowedDomains: ["localhost:3001", "foo.com", "bar.com"],
  },
});
```

#### `disallowedRoutes: array`

If you do not want to replace the authorization headers for specific routes, list them here. This can be useful if your
initial auth route(s) are on an allowed domain and take basic auth headers. These routes need to be prefixed with the correct protocol (`http://`, `https://`). If you want to add a route to the list of disallowed routes regardless of the protocol, you can prefix it with `//`.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    disallowedRoutes: [
      "http://localhost:3001/auth/",
      "https://foo.com/bar/",
      "//foo.com/bar/baz",
      /localhost:3001\/foo\/far.*/,
    ], // strings and regular expressions
  },
});
```

**Note:** If requests are sent to the same domain that is serving your Angular application, you do not need to add that domain to the `allowedDomains` array. However, this is only the case if you don't specify the domain in the `Http` request.

For example, the following request assumes that the domain is the same as the one serving your app. It doesn't need to be allowed in this case.

```ts
this.http.get('/api/things')
  .subscribe(...)
```

However, if you are serving your API at the same domain as that which is serving your Angular app **and** you are specifying that domain in `Http` requests, then it **does** need to be explicitely allowed.

```ts
// Both the Angular app and the API are served at
// localhost:4200 but because that domain is specified
// in the request, it must be allowed
this.http.get('http://localhost:4200/api/things')
  .subscribe(...)
```

#### `headerName: string`

The default header name is `Authorization`. This can be changed by specifying a custom `headerName` which is to be a string value.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    headerName: "Your Header Name",
  },
});
```

#### `authScheme: string | function(HttpRequest): string`

The default authorization scheme is `Bearer` followed by a single space. This can be changed by specifying a custom `authScheme`. You can pass a string which will prefix the token for each request.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    authScheme: "Basic ",
  },
});
```

If you want to change the auth scheme dynamically, or based on the request, you can configure a getter function which returns a string.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    authScheme: (request) => {
      if (request.url.includes("foo")) {
        return "Basic ";
      }

      return "Bearer ";
    },
  },
});
```

#### `throwNoTokenError: boolean`

Setting `throwNoTokenError` to `true` will result in an error being thrown if a token cannot be retrieved with the `tokenGetter` function. Defaults to `false`.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    throwNoTokenError: true,
  },
});
```

#### `skipWhenExpired: boolean`

By default, the user's JWT will be sent in `HttpClient` requests even if it is expired. You may choose to not allow the token to be sent if it is expired by setting `skipWhenExpired` to true.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    skipWhenExpired: true,
  },
});
```

### `JwtHelperService`

This service contains helper functions:

#### isTokenExpired (old tokenNotExpired function)

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.isTokenExpired()); // true or false
}
```

#### getTokenExpirationDate

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.getTokenExpirationDate()); // date
}
```

#### decodeToken

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.decodeToken(token)); // token
}
```

## Feedback

### Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](./CONTRIBUTING.md)
### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/auth0/angular2-jwt/issues).

### Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="./auth0_light_mode.png"   width="150">
    <source media="(prefers-color-scheme: dark)" srcset="./auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="./auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the MIT license. See the <a href="./LICENSE"> LICENSE</a> file for more info.</p>
