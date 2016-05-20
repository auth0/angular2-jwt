# angular2-jwt [![npm version](https://img.shields.io/npm/v/angular2-jwt.svg)](https://www.npmjs.com/package/angular2-jwt) [![license](https://img.shields.io/npm/l/angular2-jwt.svg)](https://www.npmjs.com/package/angular2-jwt)

**angular2-jwt** is a helper library for working with [JWTs](http://jwt.io/introduction) in your Angular 2 applications.

For examples on integrating **angular2-jwt** with Webpack and SystemJS, see [auth0-angular2](https://github.com/auth0/auth0-angular2).

## What is This Library For?

**angular2-jwt** is a small and unopinionated library that is useful for automatically attaching a [JSON Web Token (JWT)](http://jwt.io/introduction) as an `Authorization` header when making HTTP requests from an Angular 2 app. It also has a number of helper methods that are useful for doing things like decoding JWTs.

This library does not have any functionality or opinion about how you should be implementing user authentication and retrieving JWTs to begin with. Those details will vary depending on your setup, but in most cases, you will use a regular HTTP request to authenticate your users and then save their JWTs in local storage or in a cookie if successful.

For more on implementing authentication endpoints, see this tutorial for an [example using HapiJS](https://auth0.com/blog/2016/03/07/hapijs-authentication-secure-your-api-with-json-web-tokens/).

## Key Features

* Send a JWT on a per-request basis using the **explicit `AuthHttp`** class
* **Decode a JWT** from your Angular 2 app
* Check the **expiration date** of the JWT
* Conditionally allow **route navigation** based on JWT status

## Installation

```bash
npm install angular2-jwt
```

The library comes with several helpers that are useful in your Angular 2 apps.

1. `AuthHttp` - allows for individual and explicit authenticated HTTP requests
2. `tokenNotExpired` - allows you to check whether there is a non-expired JWT in local storage. This can be used for conditionally showing/hiding elements and stopping navigation to certain routes if the user isn't authenticated

## Sending Authenticated Requests

If you wish to only send a JWT on a specific HTTP request, you can use the `AuthHttp` class.

```ts
import {AuthHttp, AuthConfig, AUTH_PROVIDERS} from 'angular2-jwt';

...

class App {

  thing: string;

  constructor(public authHttp: AuthHttp) {}

  getThing() {
    this.authHttp.get('http://example.com/api/thing')
      .subscribe(
        data => this.thing = data,
        err => console.log(err),
        () => console.log('Request Complete')
      );
  }
}

bootstrap(App, [
  HTTP_PROVIDERS,
  AUTH_PROVIDERS
])
```

## Configuration Options

`AUTH_PROVIDERS` gives a default configuration setup:

* Header Name: `Authorization`
* Header Prefix: `Bearer`
* Token Name: `id_token`
* Token Getter Function: `(() => localStorage.getItem(tokenName))`
* Supress error and continue with regular HTTP request if no JWT is saved: `false`
* Global Headers: none

If you wish to configure the `headerName`, `headerPrefix`, `tokenName`, `tokenGetter` function, `noTokenScheme`, `globalHeaders`, or `noJwtError` boolean, you can pass a config object when `AuthHttp` is injected.

#### Errors

By default, if there is no valid JWT saved, `AuthHttp` will return an Observable `error` with 'Invalid JWT'. If you would like to continue with an unauthenticated request instead, you can set `noJwtError` to `true`.

#### Token Scheme

The default scheme for the `Authorization` header is `Bearer`, but you may either provide your own by specifying a `headerPrefix`, or you may remove the prefix altogether by setting `noTokenScheme` to `true`.

#### Global Headers

You may set as many global headers as you like by passing an array of header-shaped objects to `globalHeaders`.

```ts
...

bootstrap(App, [
  HTTP_PROVIDERS,
  provide(AuthHttp, {
    useFactory: (http) => {
      return new AuthHttp(new AuthConfig({
        headerName: YOUR_HEADER_NAME,
        headerPrefix: YOUR_HEADER_PREFIX,
        tokenName: YOUR_TOKEN_NAME,
        tokenGetter: YOUR_TOKEN_GETTER_FUNCTION,
        globalHeaders: [{'Content-Type':'application/json'}],
        noJwtError: true,
        noTokenScheme: true
      }), http);
    },
    deps: [Http]
  })
])
```

The `AuthHttp` class supports all the same HTTP verbs as Angular 2's Http.

### Sending Per-Request Headers

You may also send custom headers on a per-request basis with your `authHttp` request by passing them in an options object.

```ts
getThing() {
  var myHeader = new Headers();
  myHeader.append('Content-Type', 'application/json');

  this.authHttp.get('http://example.com/api/thing', { headers: myHeader} )
    .subscribe(
      data => this.thing = data,
      err => console.log(error),
      () => console.log('Request Complete')
    );

  // Pass it after the body in a POST request
  this.authHttp.post('http://example.com/api/thing', 'post body', { headers: myHeader} )
    .subscribe(
      data => this.thing = data,
      err => console.log(error),
      () => console.log('Request Complete')
    );
}
```

### Using the Observable Token Stream

If you wish to use the JWT as an observable stream, you can call `tokenStream` from `AuthHttp`.

```ts
...

tokenSubscription() {
  this.authHttp.tokenStream.subscribe(
      data => console.log(data),
      err => console.log(err),
      () => console.log('Complete')
    );
}
```

This can be useful for cases where you want to make HTTP requests out of obsevable streams. The `tokenStream` can be mapped and combined with other streams at will.

## Using JwtHelper in Components

The `JwtHelper` class has several useful methods that can be utilized in your components:

* `decodeToken`
* `getTokenExpirationDate`
* `isTokenExpired`

You can use these methods by passing in the token to be evaluated.

```ts

...

jwtHelper: JwtHelper = new JwtHelper();

...

useJwtHelper() {
  var token = localStorage.getItem('id_token');

  console.log(
    this.jwtHelper.decodeToken(token),
    this.jwtHelper.getTokenExpirationDate(token),
    this.jwtHelper.isTokenExpired(token)
  );
}

...
```

## Checking Login to Hide/Show Elements and Handle Routing

The `tokenNotExpired` function can be used to check whether a JWT exists in local storage, and if it does, whether it has expired or not. If the token is valid, `tokenNotExpired` returns `true`, otherwise it returns `false`.

The router's `@CanActivate` lifecycle hook can be used with `tokenNotExpired` to determine if a route should be accessible. This lifecycle hook is run before the component class instantiates. If `@CanActivate` receives `true`, the router will allow navigation, and if it receives `false`, it won't.

> **NOTE**: The `@CanActivate` lifecycle hook has been deprecated in the latest Angular 2 router. To use it, you need to `import` from `@angular/router-deprecated`.

> **Note:** `tokenNotExpired` will by default assume the token name is `id_token` unless a token name is passed to it, ex: `tokenNotExpired('token_name')`. This will be changed in a future release to automatically use the token name that is set in `AuthConfig`.

```ts

...

@Component({
  selector: 'secret-route'
})

@View({
  template: `<h1>If you see this, you have a JWT</h1>`
})

@CanActivate(() => tokenNotExpired())

class SecretRoute {}
```

You can pass a different `tokenName` for `@CanActivate` to use as the first argument to the function. If you wish to define your own function for `tokenNotExpired` to use, pass `null` first and then the function.

## Contributing

Pull requests are welcome!

## Development

Use `npm run dev` to compile and watch for changes.

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
