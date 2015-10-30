import {View, Component, bootstrap, provide, CORE_DIRECTIVES, NgIf} from 'angular2/angular2';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AuthHttp, tokenNotExpired, Auth0Service} from 'angular2-jwt/dist/angular2-jwt';
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
    <hr>
    <button *ng-if="loggedIn()" (click)="tokenSubscription()">Show Token from Observable</button>

  `
})

@RouteConfig([
  { path: '/public-route', component: PublicRoute, as: 'PublicRoute' }
  { path: '/private-route', component: PrivateRoute, as: 'PrivateRoute' }
])

export class AuthApp {

  auth: Auth0Service = new Auth0Service('w4ibtscMzP2Zs3jk6MteHwXZ422gGyQc', 'blogtest.auth0.com');

  constructor(public authHttp:AuthHttp) {}

  login() {

    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }

  loggedIn() {
    return tokenNotExpired();
  }

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

  tokenSubscription() {
    this.auth.token.subscribe(
        data => console.log(data),
        err => console.log(err),
        () => console.log('Complete')
      );
  }
}

bootstrap(AuthApp, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS, 
  provide(AuthHttp, { useFactory: () => {
    return new AuthHttp();
  }}),
  provide(APP_BASE_HREF, {useValue:'/'})
])