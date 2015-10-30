# angular2-jwt Example

This is an example app that shows you how to use Auth0 with Angular 2. It uses Auth0's [angular2-jwt](https://github.com/auth0/angular2-jwt) module. The example app is based off of [ng2-play](https://github.com/pkozlowski-opensource/ng2-play) by [Pawel Kozlowski](https://twitter.com/pkozlowski_os).

## Installation

```bash
npm install -g gulp
npm install
```

## Start the App

After completing installation type in your favourite shell:

```bash
gulp play
```

The app will be served at `localhost:9000`.

## Key Parts

### Import the Required **Angular 2** and **angular2-jwt** Classes.

```js
// app.ts

import {View, Component, bootstrap, provide, CORE_DIRECTIVES, NgIf} from 'angular2/angular2';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AuthHttp, Auth0Service, tokenNotExpired} from 'angular2-jwt/dist/angular2-jwt';
```

### Set up a Basic Application Component

```js
// app.ts

@Component({
  directives: [ CORE_DIRECTIVES, ROUTER_DIRECTIVES, NgIf ],
  selector: 'app',
  template: `
    <h1>Welcome to Angular2 with Auth0</h1>
    <button *ng-if="!loggedIn()" (click)="login()">Login</button>
    <button *ng-if="loggedIn()" (click)="logout()">Logout</button>
  `
})

export class AuthApp {

  auth: Auth0Service = new Auth0Service(YOUR_CLIENT_ID, YOUR_CLIENT_DOMAIN);

  constructor() {}

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }

  loggedIn() {
    return tokenNotExpired();
  }

}
```

### Make Authenticated Requests with AuthHttp

The `AuthHttp` class is used to make authenticated HTTP requests. The class uses Angular 2's **Http** module but includes the `Authorization` header for you.

```js
// app.ts

...

constructor(public authHttp:AuthHttp) {}

getSecretThing() {
  this.authHttp.get('http://example.com/api/secretthing')
    .map(res => res.json())
    .subscribe(
      data => console.log(data),
      err => console.log(err),
      () => console.log('Complete')
    );
  );
}

...

bootstrap(AuthApp, [
  HTTP_PROVIDERS,
  provide(AuthHttp, { useFactory: () => {
    return new AuthHttp();
  }})
])
```

### Protect Private Routes by Checking Token Expiry

Although data from the API will be protected and require a valid JWT to access, users that aren't authenticated will be able to get to any route by default. We can use the `@CanActivate` life-cycle hook from Angular 2's router to limit navigation on certain routes to only those with a non-expired JWT.

```js
// app.ts

import {RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF, ROUTER_PROVIDERS, CanActivate} from 'angular2/router';

@Component({
  selector: 'public-route'
})
@View({
  template: `<h1>Hello from a public route</h1>`
})
class PublicRoute {}

@Component({
  selector: 'private-route'
})

@View({
  template: `<h1>Hello from private route</h1>`
})

@CanActivate(() => tokenNotExpired())

class PrivateRoute {}

@Component({
  directives: [ CORE_DIRECTIVES, ROUTER_DIRECTIVES, NgIf ],
  selector: 'app',
  template: `
    <h1>Welcome to Angular2 with Auth0</h1>
    <button *ng-if="!loggedIn()" (click)="login()">Login</button>
    <button *ng-if="loggedIn()" (click)="logout()">Logout</button>
    <hr>
    <div>
      <button [router-link]="['./PublicRoute']">Public Route</button>
      <button *ng-if="loggedIn()" [router-link]="['./PrivateRoute']">Private Route</button>
      <router-outlet></router-outlet>
    </div>

  `
})

@RouteConfig([
  { path: '/public-route', component: PublicRoute, as: 'PublicRoute' }
  { path: '/private-route', component: PrivateRoute, as: 'PrivateRoute' }
])

export class AuthApp {

...

}

bootstrap(AuthApp, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS, 
  provide(AuthHttp, { useFactory: () => {
    return new AuthHttp();
  }}),
  provide(APP_BASE_HREF, {useValue:'/'})
])
```

### Use the JWT as an Observable

The `Auth0Service` sets a property, `token`, to be an observable stream from the user's JWT. This stream can be used with other streams and can be combined to make authenticated requests. This can be used as an alternative to the explicit `AuthHttp` class.

```js
// app.ts

tokenSubscription() {
  this.auth.token.subscribe(
      data => console.log(data),
      err => console.log(err),
      () => console.log('Complete')
    );
}
```
