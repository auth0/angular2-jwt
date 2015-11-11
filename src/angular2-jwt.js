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
};System.register(['angular2/angular2', 'angular2/http', '@reactivex/rxjs/dist/cjs/Rx'], function(exports_1) {
    var angular2_1, http_1, Rx_1;
    var AuthConfig, AuthHttp, JwtHelper;
    /**
     * Checks for presence of token and that token hasn't expired.
     * For use with the @CanActivate router decorator and NgIf
     */
    function tokenNotExpired(tokenName, jwt) {
        var authToken = tokenName || 'id_token';
        var token;
        if (jwt) {
            token = jwt;
        }
        else {
            token = localStorage.getItem(authToken);
        }
        var jwtHelper = new JwtHelper();
        if (!token || jwtHelper.isTokenExpired(token, null)) {
            return false;
        }
        else {
            return true;
        }
    }
    exports_1("tokenNotExpired", tokenNotExpired);
    return {
        setters:[
            function (_angular2_1) {
                angular2_1 = _angular2_1;
            },
            function (_http_1) {
                http_1 = _http_1;
            },
            function (_Rx_1) {
                Rx_1 = _Rx_1;
            }],
        execute: function() {
            /**
             * Sets up the authentication configuration.
             */
            AuthConfig = (function () {
                function AuthConfig(config) {
                    var _this = this;
                    this.config = config || {};
                    this.headerName = this.config.headerName || 'Authorization';
                    this.headerPrefix = this.config.headerPrefix || 'Bearer ';
                    this.tokenName = this.config.tokenName || 'id_token';
                    this.noJwtError = this.config.noJwtError || false;
                    this.tokenGetter = this.config.tokenGetter || (function () { return localStorage.getItem(_this.tokenName); });
                }
                AuthConfig.prototype.getConfig = function () {
                    return {
                        headerName: this.headerName,
                        headerPrefix: this.headerPrefix,
                        tokenName: this.tokenName,
                        tokenGetter: this.tokenGetter,
                        noJwtError: this.noJwtError
                    };
                };
                return AuthConfig;
            })();
            exports_1("AuthConfig", AuthConfig);
            /**
             * Allows for explicit authenticated HTTP requests.
             */
            AuthHttp = (function () {
                function AuthHttp(config) {
                    var _this = this;
                    this._config = new AuthConfig(config).getConfig();
                    var injector = angular2_1.Injector.resolveAndCreate([http_1.HTTP_PROVIDERS]);
                    this.http = injector.get(http_1.Http);
                    this.tokenStream = new Rx_1.Observable(function (obs) {
                        obs.next(_this._config.tokenGetter());
                    });
                }
                AuthHttp.prototype.request = function (method, url, body) {
                    var options = new http_1.RequestOptions({
                        method: method,
                        url: url,
                        body: body,
                    });
                    if (!tokenNotExpired(null, this._config.tokenGetter())) {
                        if (this._config.noJwtError) {
                            return this.http.request(new http_1.Request(options));
                        }
                        throw 'Invalid JWT';
                    }
                    var authHeader = new http_1.Headers();
                    authHeader.append(this._config.headerName, this._config.headerPrefix + this._config.tokenGetter());
                    var authOptions = new http_1.RequestOptions({
                        method: method,
                        url: url,
                        body: body,
                        headers: authHeader
                    });
                    return this.http.request(new http_1.Request(authOptions));
                };
                AuthHttp.prototype.get = function (url) {
                    return this.request(http_1.RequestMethods.Get, url);
                };
                AuthHttp.prototype.post = function (url, body) {
                    return this.request(http_1.RequestMethods.Post, url, body);
                };
                AuthHttp.prototype.put = function (url, body) {
                    return this.request(http_1.RequestMethods.Put, url, body);
                };
                AuthHttp.prototype.delete = function (url, body) {
                    return this.request(http_1.RequestMethods.Delete, url, body);
                };
                AuthHttp.prototype.options = function (url, body) {
                    return this.request(http_1.RequestMethods.Options, url, body);
                };
                AuthHttp.prototype.head = function (url, body) {
                    return this.request(http_1.RequestMethods.Head, url, body);
                };
                AuthHttp.prototype.patch = function (url, body) {
                    return this.request(http_1.RequestMethods.Patch, url, body);
                };
                AuthHttp = __decorate([
                    angular2_1.Injectable(), 
                    __metadata('design:paramtypes', [Object])
                ], AuthHttp);
                return AuthHttp;
            })();
            exports_1("AuthHttp", AuthHttp);
            /**
             * Helper class to decode and find JWT expiration.
             */
            JwtHelper = (function () {
                function JwtHelper() {
                }
                JwtHelper.prototype.urlBase64Decode = function (str) {
                    var output = str.replace(/-/g, '+').replace(/_/g, '/');
                    switch (output.length % 4) {
                        case 0: {
                            break;
                        }
                        case 2: {
                            output += '==';
                            break;
                        }
                        case 3: {
                            output += '=';
                            break;
                        }
                        default: {
                            throw 'Illegal base64url string!';
                        }
                    }
                    return decodeURIComponent(escape(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
                };
                JwtHelper.prototype.decodeToken = function (token) {
                    var parts = token.split('.');
                    if (parts.length !== 3) {
                        throw new Error('JWT must have 3 parts');
                    }
                    var decoded = this.urlBase64Decode(parts[1]);
                    if (!decoded) {
                        throw new Error('Cannot decode the token');
                    }
                    return JSON.parse(decoded);
                };
                JwtHelper.prototype.getTokenExpirationDate = function (token) {
                    var decoded;
                    decoded = this.decodeToken(token);
                    if (typeof decoded.exp === "undefined") {
                        return null;
                    }
                    var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
                    date.setUTCSeconds(decoded.exp);
                    return date;
                };
                JwtHelper.prototype.isTokenExpired = function (token, offsetSeconds) {
                    var date = this.getTokenExpirationDate(token);
                    offsetSeconds = offsetSeconds || 0;
                    if (date === null) {
                        return false;
                    }
                    // Token expired?
                    return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
                };
                return JwtHelper;
            })();
            exports_1("JwtHelper", JwtHelper);
        }
    }
});
//# sourceMappingURL=angular2-jwt.js.map