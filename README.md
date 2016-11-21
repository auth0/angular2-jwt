# ng2-bearer
[![Build Status](https://travis-ci.org/angulab/ng2-bearer.svg?branch=master)](https://travis-ci.org/auth0/ng2-bearer)
[![npm version](https://img.shields.io/npm/v/ng2-bearer.svg)](https://www.npmjs.com/package/ng2-bearer) [![license](https://img.shields.io/npm/l/ng2-bearer.svg)](https://www.npmjs.com/package/ng2-bearer)

**ng2-bearer** is a helper library for working with [Bearer Tokens](https://tools.ietf.org/html/rfc6750) in your Angular 2 applications.

It is based on [angular2-jwt](https://github.com/auth0/angular2-jwt), but it allows to use any kind of Bearer Token, while `angular2-jwt` only supports [JWTs](https://tools.ietf.org/html/rfc7519).

##Contents
 - [What is this Library for?](#what-is-this-library-for)
 - [Key Features](#key-features)
 - [Installation](#installation)
 - [Using `AUTH_PROVIDERS`](#using-auth_providers)
 - [Sending Authenticated Requests](#sending-authenticated-requests)
 - [Configuration Options](#configuration-options)
 - [Configuring ng2-bearer with `provideAuth`](#configuring-ng2-bearer-with-provideauth)
    - [Configuation for Ionic 2](#configuation-for-ionic-2)
    - [Sending Per-Request Headers](#sending-per-request-headers)
    - [Using the Observable Token Stream](#using-the-observable-token-stream)
 - [Checking Authentication to Hide/Show Elements and Handle Routing](#checking-authentication-to-hideshow-elements-and-handle-routing)
 - [Contributing](#contributing)
 - [Development](#development)
 - [Issue Reporting](#issue-reporting)
 - [Author](#author)
 - [License](#license)
 
## What is this Library for?

**ng2-bearer** is a small and unopinionated library that is useful for automatically attaching a [Bearer Token](https://tools.ietf.org/html/rfc6750) as an `Authorization` header when making HTTP requests from an Angular 2 app.

This library does not have any functionality for (or opinion about) implementing user authentication and retrieving tokens to begin with. Those details will vary depending on your setup, but in most cases, you will use a regular HTTP request to authenticate your users and then save their tokens in local storage or in a cookie if successful.

## Key Features

* Send a Token on a per-request basis using the **explicit `AuthHttp`** class
* Conditionally allow **route navigation** based on Token presence

## Installation

```bash
npm install ng2-bearer
```

The library comes with several helpers that are useful in your Angular 2 apps.

1. `AuthHttp` - allows for individual and explicit authenticated HTTP requests
2. `tokenIsPresent` - allows you to check whether the token is present in the local storage. This can be used for conditionally showing/hiding elements and stopping navigation to certain routes if the user isn't authenticated

## Using `AUTH_PROVIDERS`

Add `AUTH_PROVIDERS` to the `providers` array in your `@NgModule`.

```ts
import { NgModule } from '@angular/core';
import { AUTH_PROVIDERS } from 'ng2-bearer';

...

@NgModule({
  ...
  
  providers: [
    AUTH_PROVIDERS
  ],
  
  ...
})
```

## Sending Authenticated Requests

If you wish to only send a token on a specific HTTP request, you can use the `AuthHttp` class. This class is a wrapper for Angular 2's `Http` and thus supports all the same HTTP methods.

```ts
import { AuthHttp } from 'ng2-bearer';

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
```

## Configuration Options

`AUTH_PROVIDERS` gives a default configuration setup:

* Header Name: `Authorization`
* Header Prefix: `Bearer`
* Token Name: `access_token`
* Token Getter Function: `(() => localStorage.getItem(tokenName))`
* Supress error and continue with regular HTTP request if no token is saved: `false`
* Global Headers: none

If you wish to configure the `headerName`, `headerPrefix`, `tokenName`, `tokenGetter` function, `noTokenScheme`, `globalHeaders`, or `noTokenError` boolean, you can using `provideAuth` or the factory pattern (see below).

#### Errors

By default, if there is no valid Token saved, `AuthHttp` will return an Observable `error` with 'Invalid Token'. If you would like to continue with an unauthenticated request instead, you can set `noTokenError` to `true`.

#### Token Scheme

The default scheme for the `Authorization` header is `Bearer`, but you may either provide your own by specifying a `headerPrefix`, or you may remove the prefix altogether by setting `noTokenScheme` to `true`.

#### Global Headers

You may set as many global headers as you like by passing an array of header-shaped objects to `globalHeaders`.

### Configuring ng2-bearer with `provideAuth`

You may customize any of the above options using `provideAuth` in the `providers` array in your `@NgModule`.

```ts
import { NgModule } from '@angular/core';
import { provideAuth } from 'ng2-bearer';

...

@NgModule({
  ...
  
  providers: [
    provideAuth({
      headerName: YOUR_HEADER_NAME,
      headerPrefix: YOUR_HEADER_PREFIX,
      tokenName: YOUR_TOKEN_NAME,
      tokenGetter: YOUR_TOKEN_GETTER_FUNCTION,
      globalHeaders: [{'Content-Type':'application/json'}],
      noTokenError: true,
      noTokenScheme: true
    })
  ],
  
  ...
})
```

### Configuation for Ionic 2

To configure ng2-bearer in Ionic 2 applications, use the factory pattern in your `@NgModule`. Since Ionic 2 provides its own API for accessing local storage, configure the `tokenGetter` to use it.

```ts
import { AuthHttp, AuthConfig } from 'ng2-bearer';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

let storage = new Storage();

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: YOUR_HEADER_PREFIX,
    noTokenError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() => storage.get('access_token')),
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
    
  ...
  
  bootstrap: [IonicApp],
  
  ...
})
```

To use `tokenIsPresent` with Ionic 2, use the `Storage` class directly in the function.

```ts
import { Storage } from '@ionic/storage';
import { tokenIsPresent } from 'ng2-bearer';

let storage = new Storage();

this.storage.get('access_token').then(token => {
    console.log(tokenIsPresent(null, token)); // Returns true/false
});

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

If you wish to use the token as an observable stream, you can call `tokenStream` from `AuthHttp`.

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

This can be useful for cases where you want to make HTTP requests out of observable streams. The `tokenStream` can be mapped and combined with other streams at will.

## Checking Authentication to Hide/Show Elements and Handle Routing

The `tokenIsPresent` function can be used to check whether a token exists in local storage. If the token is present, `tokenIsPresent` returns `true`, otherwise it returns `false`.

> **Note:** `tokenIsPresent` will by default assume the token name is `access_token` unless a token name is passed to it, ex: `tokenIsPresent('token_name')`. This will be changed in a future release to automatically use the token name that is set in `AuthConfig`.

```ts
// auth.service.ts

import { tokenIsPresent } from 'ng2-bearer';

...

loggedIn() {
  return tokenIsPresent();
}

...
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
...

import { AuthGuard } from './auth.guard';

export const routes: RouterConfig = [
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent }
];

...
```

## Contributing

Pull requests are welcome!

## Development

Use `npm run dev` to compile and watch for changes.


## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Authors

- [Auth0](auth0.com)
- Andre Soares

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
