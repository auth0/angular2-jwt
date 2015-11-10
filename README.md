# angular2-jwt

angular2-jwt is a helper library for working with [JWTs](http://jwt.io/introduction) in your Angular 2 applications.

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
2. `AuthStatus` - allows you to check whether there is a non-expired JWT in local storage. This can be used for conditionally showing/hiding elements and stopping navigation to certain routes if the user isn't authenticated

## Sending Authenticated Requests

If you wish to only send a JWT on a specific HTTP request, you can use the `AuthHttp` class.

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
  provide(AuthHttp, { useFactory: () => {
    return new AuthHttp()
  }})
])
```

A default configuration for header and token details is provided:

* Header Name: `Authorization`
* Header Prefix: `Bearer`
* Token Name: `id_token`
* Token Getter Function: `(() => localStorage.getItem(tokenName))`
* Supress error and continue with regular HTTP request if no JWT is saved: `false`

If you wish to configure the `headerName`, `headerPrefix`, `tokenName`, `tokenGetter` function, or `noJwtError` boolean, you can pass a config object when `AuthHttp` is injected.

By default, if there is no valid JWT saved, `AuthHttp` will throw an 'Invalid JWT' error. If you would like to continue with an unauthenticated request instead, you can set `noJwtError` to `true`.

```js
// app.ts

...

bootstrap(App, [
  HTTP_PROVIDERS,
  provide(AuthHttp, { useFactory: () => {
    return new AuthHttp({
      headerName: YOUR_HEADER_NAME,
      headerPrefix: YOUR_HEADER_PREFIX,
      tokenName: YOUR_TOKEN_NAME,
      tokenGetter: YOUR_TOKEN_GETTER_FUNCTION,
      noJwtError: true 
    })
  }})
])
```

The `AuthHttp` class supports all the same HTTP verbs as Angular 2's Http.

### Using the Observable Token Stream

If you wish to use the JWT as an observable stream, you can call `tokenStream` from `AuthHttp`.

```js
// app.ts

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

```js
// app.ts

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

```js
// app.ts

...

import {Component, View, bootstrap, provide} from 'angular2/http';
import {tokenNotExpired} from 'angular2-jwt/angular2-jwt';
import {RouteConfig, RouteParams, ROUTER_DIRECTIVES, APP_BASE_HREF, ROUTER_PROVIDERS, CanActivate} from 'angular2/router'

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

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.


