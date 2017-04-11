# angular2-jwt
[![Build Status](https://travis-ci.org/auth0/angular2-jwt.svg?branch=master)](https://travis-ci.org/auth0/angular2-jwt)
[![npm version](https://img.shields.io/npm/v/angular2-jwt.svg)](https://www.npmjs.com/package/angular2-jwt) [![license](https://img.shields.io/npm/l/angular2-jwt.svg)](https://www.npmjs.com/package/angular2-jwt)

**angular2-jwt** is a helper library for working with [JWTs](http://jwt.io/introduction) in your Angular 2 applications.

For examples of integrating **angular2-jwt** with SystemJS, see [auth0-angular2](https://github.com/auth0-samples/auth0-angularjs2-systemjs-sample).


##Contents
 - [What is this Library for?](#what-is-this-library-for)
 - [Key Features](#key-features)
 - [Installation](#installation)
 - [Basic Configuration](#basic-configuration)
 - [Sending Authenticated Requests](#sending-authenticated-requests)
 - [Configuration Options](#configuration-options)
    - [Advanced Configuration](#advanced-configuration)
    - [Configuration for Ionic 2](#configuration-for-ionic-2)
    - [Sending Per-Request Headers](#sending-per-request-headers)
    - [Using the Observable Token Stream](#using-the-observable-token-stream)
    - [Using JwtHelper in Components](#using-jwthelper-in-components)
 - [Checking Authentication to Hide/Show Elements and Handle Routing](#checking-authentication-to-hideshow-elements-and-handle-routing)
 - [Contributing](#contributing)
 - [Development](#development)
 - [What is Auth0?](#what-is-auth0)
 - [Create a free account in Auth0](#create-a-free-account-in-auth0)
 - [Issue Reporting](#issue-reporting)
 - [Author](#author)
 - [License](#license)


## What is this Library for?

**angular2-jwt** is a small and unopinionated library that is useful for automatically attaching a [JSON Web Token (JWT)](http://jwt.io/introduction) as an `Authorization` header when making HTTP requests from an Angular 2 app. It also has a number of helper methods that are useful for doing things like decoding JWTs.

This library does not have any functionality for (or opinion about) implementing user authentication and retrieving JWTs to begin with. Those details will vary depending on your setup, but in most cases, you will use a regular HTTP request to authenticate your users and then save their JWTs in local storage or in a cookie if successful.

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


## Basic Configuration

Create a new `auth.module.ts` file with the following code:

```ts
import { NgModule } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig(), http, options);
}

@NgModule({
  providers: [
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }
  ]
})
export class AuthModule {}
```

We added a factory function to use as a provider for `AuthHttp`. This will allow you to configure angular2-jwt in the `AuthConfig` instance later on.


## Sending Authenticated Requests

If you wish to only send a JWT on a specific HTTP request, you can use the `AuthHttp` class. This class is a wrapper for Angular 2's `Http` and thus supports all the same HTTP methods.

```ts
import { AuthHttp } from 'angular2-jwt';
// ...
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
```


## Configuration Options

`AUTH_PROVIDERS` gives a default configuration setup:

* Header Name: `Authorization`
* Header Prefix: `Bearer`
* Token Name: `token`
* Token Getter Function: `(() => localStorage.getItem(tokenName))`
* Supress error and continue with regular HTTP request if no JWT is saved: `false`
* Global Headers: none

If you wish to configure the `headerName`, `headerPrefix`, `tokenName`, `tokenGetter` function, `noTokenScheme`, `globalHeaders`, or `noJwtError` boolean, you can using `provideAuth` or the factory pattern (see below).

#### Errors

By default, if there is no valid JWT saved, `AuthHttp` will return an Observable `error` with 'Invalid JWT'. If you would like to continue with an unauthenticated request instead, you can set `noJwtError` to `true`.

#### Token Scheme

The default scheme for the `Authorization` header is `Bearer`, but you may either provide your own by specifying a `headerPrefix`, or you may remove the prefix altogether by setting `noTokenScheme` to `true`.

#### Global Headers

You may set as many global headers as you like by passing an array of header-shaped objects to `globalHeaders`.

### Advanced Configuration

You may customize any of the above options using a factory which returns an `AuthHttp` instance with the options you would like to change.

```ts
import { NgModule } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'token',
		tokenGetter: (() => sessionStorage.getItem('token')),
		globalHeaders: [{'Content-Type':'application/json'}],
	}), http, options);
}

@NgModule({
  providers: [
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }
  ]
})
export class AuthModule {}
```

### Configuration for Ionic 2

To configure angular2-jwt in Ionic 2 applications, use the factory pattern in your `@NgModule`. Since Ionic 2 provides its own API for accessing local storage, configure the `tokenGetter` to use it.

```ts
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

let storage = new Storage();

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: YOUR_HEADER_PREFIX,
    noJwtError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() => storage.get('token')),
  }), http);
}

@NgModule({
  imports: [
    IonicModule.forRoot(MyApp),
  ],
  providers: [
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    },
  // ...
  bootstrap: [IonicApp],
  // ...
})
```

### Sending Per-Request Headers

You may also send custom headers on a per-request basis with your `authHttp` request by passing them in an options object.

```ts
getThing() {
  let myHeader = new Headers();
  myHeader.append('Content-Type', 'application/json');

  this.authHttp.get('http://example.com/api/thing', { headers: myHeader })
    .subscribe(
      data => this.thing = data,
      err => console.log(error),
      () => console.log('Request Complete')
    );

  // Pass it after the body in a POST request
  this.authHttp.post('http://example.com/api/thing', 'post body', { headers: myHeader })
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
tokenSubscription() {
  this.authHttp.tokenStream.subscribe(
      data => console.log(data),
      err => console.log(err),
      () => console.log('Complete')
    );
}
```

This can be useful for cases where you want to make HTTP requests out of observable streams. The `tokenStream` can be mapped and combined with other streams at will.


## Using JwtHelper in Components

The `JwtHelper` class has several useful methods that can be utilized in your components:

* `decodeToken`
* `getTokenExpirationDate`
* `isTokenExpired`

You can use these methods by passing in the token to be evaluated.

```ts
jwtHelper: JwtHelper = new JwtHelper();

useJwtHelper() {
  var token = localStorage.getItem('token');

  console.log(
    this.jwtHelper.decodeToken(token),
    this.jwtHelper.getTokenExpirationDate(token),
    this.jwtHelper.isTokenExpired(token)
  );
}
```


## Checking Authentication to Hide/Show Elements and Handle Routing

The `tokenNotExpired` function can be used to check whether a JWT exists in local storage, and if it does, whether it has expired or not. If the token is valid, `tokenNotExpired` returns `true`, otherwise it returns `false`.

> **Note:** `tokenNotExpired` will by default assume the token name is `token` unless a token name is passed to it, ex: `tokenNotExpired('token_name')`. This will be changed in a future release to automatically use the token name that is set in `AuthConfig`.

```ts
// auth.service.ts

import { tokenNotExpired } from 'angular2-jwt';

loggedIn() {
  return tokenNotExpired();
}
```

The `loggedIn` method can now be used in views to conditionally hide and show elements.

```html
 <button id="login" *ngIf="!auth.loggedIn()">Log In</button>
 <button id="logout" *ngIf="auth.loggedIn()">Log Out</button>
```

To guard routes that should be limited to authenticated users, set up an `AuthGuard`.

```ts
// auth-guard.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { Auth } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: Auth, private router: Router) {}

  canActivate() {
    if(this.auth.loggedIn()) {
      return true;
    } else {
      this.router.navigate(['unauthorized']);
      return false;
    }
  }
}
```

With the guard in place, you can use it in your route configuration.

```ts
import { AuthGuard } from './auth.guard';

export const routes: RouterConfig = [
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent }
];
```


## Contributing

Pull requests are welcome!


## Development

Use `npm run dev` to compile and watch for changes.


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
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

[Auth0](https://auth0.com)


## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
