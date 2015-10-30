System.register(['angular2/angular2', 'angular2/http', 'angular2-jwt/dist/angular2-jwt', 'angular2/router'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var angular2_1, http_1, angular2_jwt_1, router_1;
    var PublicRoute, PrivateRoute, AuthApp;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (angular2_jwt_1_1) {
                angular2_jwt_1 = angular2_jwt_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            PublicRoute = (function () {
                function PublicRoute() {
                }
                PublicRoute = __decorate([
                    angular2_1.Component({
                        selector: 'public-route'
                    }),
                    angular2_1.View({
                        template: "<h1>Hello from a public route</h1>"
                    }), 
                    __metadata('design:paramtypes', [])
                ], PublicRoute);
                return PublicRoute;
            })();
            PrivateRoute = (function () {
                function PrivateRoute() {
                }
                PrivateRoute = __decorate([
                    angular2_1.Component({
                        selector: 'private-route'
                    }),
                    angular2_1.View({
                        template: "<h1>Hello from private route</h1>"
                    }),
                    router_1.CanActivate(function () { return angular2_jwt_1.tokenNotExpired(); }), 
                    __metadata('design:paramtypes', [])
                ], PrivateRoute);
                return PrivateRoute;
            })();
            AuthApp = (function () {
                function AuthApp(authHttp) {
                    this.authHttp = authHttp;
                    this.auth = new angular2_jwt_1.Auth0Service('w4ibtscMzP2Zs3jk6MteHwXZ422gGyQc', 'blogtest.auth0.com');
                }
                AuthApp.prototype.login = function () {
                    this.auth.login();
                };
                AuthApp.prototype.logout = function () {
                    this.auth.logout();
                };
                AuthApp.prototype.loggedIn = function () {
                    return angular2_jwt_1.tokenNotExpired();
                };
                AuthApp.prototype.getSecretThing = function () {
                    this.authHttp.get('http://example.com/api/secretthing')
                        .map(function (res) { return res.json(); })
                        .subscribe(function (data) { return console.log(data); }, function (err) { return console.log(err); }, function () { return console.log('Complete'); });
                    ;
                };
                AuthApp.prototype.tokenSubscription = function () {
                    this.auth.token.subscribe(function (data) { return console.log(data); }, function (err) { return console.log(err); }, function () { return console.log('Complete'); });
                };
                AuthApp = __decorate([
                    angular2_1.Component({
                        directives: [angular2_1.CORE_DIRECTIVES, router_1.ROUTER_DIRECTIVES, angular2_1.NgIf],
                        selector: 'app',
                        template: "\n    <h1>Welcome to Angular2 with Auth0</h1>\n    <button *ng-if=\"!loggedIn()\" (click)=\"login()\">Login</button>\n    <button *ng-if=\"loggedIn()\" (click)=\"logout()\">Logout</button>\n    <hr>\n    <div>\n      <button [router-link]=\"['./PublicRoute']\">Public Route</button>\n      <button *ng-if=\"loggedIn()\" [router-link]=\"['./PrivateRoute']\">Private Route</button>\n      <router-outlet></router-outlet>\n    </div>\n    <hr>\n    <button *ng-if=\"loggedIn()\" (click)=\"tokenSubscription()\">Show Token from Observable</button>\n\n  "
                    }),
                    router_1.RouteConfig([
                        { path: '/public-route', component: PublicRoute, as: 'PublicRoute' },
                        { path: '/private-route', component: PrivateRoute, as: 'PrivateRoute' }
                    ]), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof angular2_jwt_1.AuthHttp !== 'undefined' && angular2_jwt_1.AuthHttp) === 'function' && _a) || Object])
                ], AuthApp);
                return AuthApp;
                var _a;
            })();
            exports_1("AuthApp", AuthApp);
            angular2_1.bootstrap(AuthApp, [
                http_1.HTTP_PROVIDERS,
                router_1.ROUTER_PROVIDERS,
                angular2_1.provide(angular2_jwt_1.AuthHttp, { useFactory: function () {
                        return new angular2_jwt_1.AuthHttp();
                    } }),
                angular2_1.provide(router_1.APP_BASE_HREF, { useValue: '/' })
            ]);
        }
    }
});
