# angular2-jwt

angular2-jwt is a helper library for working with [JWTs](http://jwt.io) in your Angular 2 applications.

## Key Features

* **Decode a JWT** from your Angular 2 app
* Check the **expiration date** of the JWT
* Automatically **send the JWT with every request** made to the server
* Choose to send a JWT on a per-request basis using the explicit `AuthHttp` method

## Installation

Clone the repo, include `angular2-jwt.js` in your project and `import` it into your Angular 2 app.

The library comes with several classes that are useful in your Angular 2 apps.

1. `AuthRequestOptions` - extends `BaseRequestOptions` to add a JWT as a header to all HTTP requests
2. `AuthHttp` - allows for individual and explicit authenticated HTTP requests
3. `AuthStatus` - allows you to check whether there is a non-expired JWT in local storage. This can be used for conditionally showing/hiding elements and stopping navigation to certain routes if the user isn't authenticated

```js
// app.ts

import {AuthRequestOptions, AuthHttp, AuthStatus} from 'angular2-jwt/angular2-jwt';

...
```
## Sending a JWT for All HTTP Requests

You can use `AuthRequestOptions` to send a JWT in all HTTP requests.

```js
// app.ts

import {Component, View, bootstrap, provide} from 'angular2/angular2';
import {HTTP_PROVIDERS, Http, RequestOptions} from 'angular2/http';
import {AuthRequestOptions} from 'angular2-jwt/angular2-jwt';

...

class App {
  
  public static authRequest = new AuthRequestOptions();
  thing: string;

  constructor(public http:Http) {}

  getThing() {
    this.http.get('http://example.com/api/thing')
      .map(res => res.json())
      .subscribe(
        data => this.thing = data,
        err => console.log(error),
        () => console.log('Request Complete')
      );
  }
}

bootstrap(App, [
  HTTP_PROVIDERS,
  provide(RequestOptions, { useValue: App.authRequest })
])
```

A default configuration for header and token details is provided:

* Header Name: `Authorization`
* Header Prefix: `Bearer`
* Token Name: `id_token`

You may also provide your own configuration by passing a config object when instantiating the `AuthRequestOptions` class.

```js
// app.ts

...

public static authRequest = new AuthRequestOptions({
  headerName: YOUR_HEADER_NAME,
  headerPrefix: YOUR_HEADER_PREFIX,
  tokenName: YOUR_TOKEN_NAME
});
```

## Sending a JWT Only for Specific Requests

If you wish to only send a JWT on a specific HTTP request rather than on all requests, you can use the `AuthHttp` class.

```js
// app.ts

import {Component, View, bootstrap, provide} from 'angular2/angular2';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp} from 'angular2-jwt/angular2-jwt';

...

class App {
  
  thing: string;

  constructor(public authHttp:AuthHttp) {}

  getThing() {
    this.authHttp.get('http://example.com/api/thing')
      .map(res => res.json())
      .subscribe(
        data => this.thing = data,
        err => console.log(error),
        () => console.log('Request Complete')
      );
  }
}

bootstrap(App, [
  HTTP_PROVIDERS,
  AuthHttp
])
```

The `AuthHttp` class supports all HTTP verbs that Angular 2 Http does.

## Checking Login to Hide/Show Elements and Handle Routing

The `AuthStatus` class has one static method, `tokenNotExpired`, that can be used to check whether a JWT exists in storage, and if it does, whether it has expired or not. If the token is valid, `tokenNotExpired` returns `true`, otherwise it returns `false`. 

Implementing this as a static method is useful because it can be used with the router's `@CanActivate` lifecycle hook, which is run before the component class instantiates. If `@CanActivate` receives `true`, the router will allow navigation, and if it receives `false`, it won't.

```js
// app.ts

...

import {Component, View, bootstrap, provide} from 'angular2/http';
import {AuthStatus} from 'dist/angular2-jwt';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES, APP_BASE_HREF, ROUTER_PROVIDERS, CanActivate} from 'angular2/router'

@Component({
  selector: 'secret-route'
})

@View({
  template: `<h1>If you see this, you have a JWT</h1>`
})

@CanActivate(() => AuthStatus.tokenNotExpired())

class SecretRoute {}
```

## Development

To extend or contribute to this library, first clone the repo. A gulp task is set up for transpiling the TypeScript file to ES5. Just run `gulp` and changes will be watched.

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

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.


