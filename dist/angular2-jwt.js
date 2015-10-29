System.register(['angular2/angular2', 'angular2/http'], function(exports_1) {
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
    var angular2_1, http_1;
    var AuthConfig, AuthHttp, JwtHelper, AuthStatus;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            /**
             * Sets up the authentication configuration.
             */
            AuthConfig = (function () {
                function AuthConfig(config) {
                    this.config;
                    Object = config || {};
                    this._headerName = this.config.headerName || 'Authorization';
                    this._headerPrefix = this.config.headerPrefix || 'Bearer ';
                    this._tokenName = this.config.tokenName || 'id_token';
                    this._jwt = localStorage.getItem(this._tokenName);
                    return {
                        headerName: this._headerName,
                        headerPrefix: this._headerPrefix,
                        tokenName: this._tokenName,
                        jwt: this._jwt
                    };
                }
                return AuthConfig;
            })();
            exports_1("AuthConfig", AuthConfig);
            /**
             * Allows for explicit authenticated HTTP requests.
             */
            AuthHttp = (function () {
                function AuthHttp(config) {
                    this._config = new AuthConfig(config);
                    var injector = angular2_1.Injector.resolveAndCreate([http_1.HTTP_PROVIDERS]);
                    this.http = injector.get(http_1.Http);
                }
                AuthHttp.prototype.request = function (method, url, body) {
                    if (this.getJwt() === null || this.getJwt() === undefined || this.getJwt() === '') {
                        throw 'No JWT Saved';
                    }
                    var authHeader = new http_1.Headers();
                    authHeader.append(this._config.headerName, this._config.headerPrefix + this.getJwt());
                    return this.http.request(new http_1.Request({
                        method: method,
                        url: url,
                        body: body,
                        headers: authHeader
                    }));
                };
                AuthHttp.prototype.getJwt = function () {
                    return localStorage.getItem(this._config.tokenName);
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
            /**
             * Checks for presence of token and that token hasn't expired.
             * For use with the @CanActivate router decorator.
             */
            AuthStatus = (function () {
                function AuthStatus() {
                }
                AuthStatus.tokenNotExpired = function (tokenName) {
                    this.tokenName = tokenName || 'id_token';
                    this.token = localStorage.getItem(this.tokenName);
                    var jwtHelper = new JwtHelper();
                    if (!this.token) {
                        throw 'No token saved!';
                    }
                    if (jwtHelper.isTokenExpired(this.token)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                };
                return AuthStatus;
            })();
            exports_1("AuthStatus", AuthStatus);
        }
    }
});
