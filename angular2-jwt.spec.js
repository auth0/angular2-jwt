"use strict";
require("core-js");
var angular2_jwt_1 = require("./angular2-jwt");
var rxjs_1 = require("rxjs");
var angular2_jwt_test_helpers_1 = require("./angular2-jwt-test-helpers");
var http_1 = require("@angular/http");
var expiredToken = angular2_jwt_test_helpers_1.encodeTestToken({
    "exp": 0
});
var validToken = angular2_jwt_test_helpers_1.encodeTestToken({
    "exp": 9999999999
});
var noExpiryToken = angular2_jwt_test_helpers_1.encodeTestToken({
    "sub": "1234567890",
    "name": "John Doe",
    "admin": true
});
describe('AuthConfig', function () {
    'use strict';
    it('should have default values', function () {
        var config = new angular2_jwt_1.AuthConfig().getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe("Authorization");
        expect(config.headerPrefix).toBe("Bearer ");
        expect(config.tokenName).toBe("token");
        expect(config.noJwtError).toBe(false);
        expect(config.noTokenScheme).toBe(false);
        expect(config.globalHeaders).toEqual([]);
        expect(config.tokenGetter).toBeDefined();
        var token = "Token";
        localStorage.setItem(config.tokenName, token);
        expect(config.tokenGetter()).toBe(token);
    });
    it('should have default values', function () {
        var configExpected = {
            headerName: "Foo",
            headerPrefix: "Bar",
            tokenName: "token",
            tokenGetter: function () { return "this is a token"; },
            noJwtError: true,
            globalHeaders: [{ "header": "value" }, { "header2": "value2" }],
            noTokenScheme: true
        };
        var config = new angular2_jwt_1.AuthConfig(configExpected).getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe(configExpected.headerName);
        expect(config.headerPrefix).toBe(configExpected.headerPrefix + " ");
        expect(config.tokenName).toBe(configExpected.tokenName);
        expect(config.noJwtError).toBe(configExpected.noJwtError);
        expect(config.noTokenScheme).toBe(configExpected.noTokenScheme);
        expect(config.globalHeaders).toEqual(configExpected.globalHeaders);
        expect(config.tokenGetter).toBeDefined();
        expect(config.tokenGetter()).toBe("this is a token");
    });
    it('should use custom token name in default tokenGetter', function () {
        var configExpected = { tokenName: 'Token' };
        var token = 'token';
        var config = new angular2_jwt_1.AuthConfig(configExpected).getConfig();
        localStorage.setItem(configExpected.tokenName, token);
        expect(config).toBeDefined();
        expect(config.tokenName).toBe(configExpected.tokenName);
        expect(config.tokenGetter()).toBe(token);
    });
});
describe('JwtHelper', function () {
    'use strict';
    var jwtHelper;
    beforeEach(function () {
        jwtHelper = new angular2_jwt_1.JwtHelper();
    });
    describe('urlBase64Decode', function () {
        it('should successfully decode payloads with funny symbols (A Euro symbol in this case) simplified', function () {
            var expected = "€";
            var payload = "4oKs";
            var actual = jwtHelper.urlBase64Decode(payload);
            expect(actual).toBe(expected);
        });
    });
    describe('decodeToken', function () {
        it('should handle a valid token', function () {
            var payload = {
                exp: 0
            };
            var token = angular2_jwt_test_helpers_1.encodeTestToken(payload);
            var actual = jwtHelper.decodeToken(token);
            expect(actual).toEqual(payload);
        });
    });
    describe('getTokenExpirationDate', function () {
    });
    describe('isTokenExpired', function () {
        it('should return false when the token is not expired', function () {
            var actual = jwtHelper.isTokenExpired(validToken);
            expect(actual).toBe(false);
        });
        it('should return true when the token is expired', function () {
            var actual = jwtHelper.isTokenExpired(expiredToken);
            expect(actual).toBe(true);
        });
        it('should return false when the token doesn\'t have an expiry date', function () {
            var actual = jwtHelper.isTokenExpired(noExpiryToken);
            expect(actual).toBe(false);
        });
        // it('should return false when the token is expired, but within the grace period', ()=> {
        //     console.log("test start");
        //     // return a date that has expired 5 seconds ago
        //     jwtHelper.getTokenExpirationDate=(token:string)=>{
        //         const date=new Date(new Date().valueOf()-5000);
        //         console.log("token date",date);
        //         console.log("actual date",new Date());
        //         return date;
        //     };
        //     //token doesn't matter because we mocked getTokenExpirationDate
        //     const tokenExpired:boolean=jwtHelper.isTokenExpired("");
        //     expect(tokenExpired).toBe(true,"token should be expired");
        //     const tokenExpired:boolean=jwtHelper.isTokenExpired("",6);
        //     expect(tokenExpired).toBe(false,"token should be within the grace period");
        //     console.log("test end");
        // });
        // it('should return true when the token is expired and outside the grace period', ()=> {
        //     // return a date that has expired 5 seconds ago
        //     jwtHelper.getTokenExpirationDate=(token:string)=>new Date(new Date().valueOf()-5000);
        //     //token doesn't matter because we mocked getTokenExpirationDate
        //     const tokenExpired:boolean=jwtHelper.isTokenExpired("");
        //     expect(tokenExpired).toBe(false,"token should be expired");
        //     const tokenExpired:boolean=jwtHelper.isTokenExpired("",3);
        //     expect(tokenExpired).toBe(true,"token should not be within the grace period");
        // });
    });
});
describe('tokenNotExpired', function () {
    'use strict';
    it('should use the passed token when not expired', function () {
        var actual = angular2_jwt_1.tokenNotExpired(null, validToken);
        expect(actual).toBe(true);
    });
    it('should use the passed token when expired', function () {
        var actual = angular2_jwt_1.tokenNotExpired(null, expiredToken);
        expect(actual).toBe(false);
    });
    it('should use the passed tokenName when not expired', function () {
        localStorage.setItem("Valid", validToken);
        var actual = angular2_jwt_1.tokenNotExpired("Valid");
        expect(actual).toBe(true);
    });
    it('should use the passed tokenName when expired', function () {
        localStorage.setItem("Expired", expiredToken);
        var actual = angular2_jwt_1.tokenNotExpired("Expired");
        expect(actual).toBe(false);
    });
    it('should use the defaults when not expired', function () {
        localStorage.setItem("token", validToken);
        var actual = angular2_jwt_1.tokenNotExpired();
        expect(actual).toBe(true);
    });
    it('should use the defaults when expired', function () {
        localStorage.setItem("token", expiredToken);
        var actual = angular2_jwt_1.tokenNotExpired();
        expect(actual).toBe(false);
    });
});
describe("AuthHttp", function () {
    describe("request", function () {
        it("handles tokenGetters returning string", function () {
            var authHttp = new angular2_jwt_1.AuthHttp(new angular2_jwt_1.AuthConfig({
                tokenGetter: function () { return validToken; }
            }), null);
            spyOn(authHttp, "requestWithToken").and.stub();
            authHttp.request(null).subscribe();
            expect(authHttp["requestWithToken"]).toHaveBeenCalledWith(null, validToken);
        });
        it("handles tokenGetters returning Promise\<string\>", function (done) {
            var authHttp = new angular2_jwt_1.AuthHttp(new angular2_jwt_1.AuthConfig({
                tokenGetter: function () { return Promise.resolve(validToken); }
            }), null);
            spyOn(authHttp, "requestWithToken").and.returnValue(rxjs_1.Observable.of(""));
            authHttp.request(null).subscribe(function () {
                expect(authHttp["requestWithToken"]).toHaveBeenCalledWith(null, validToken);
                done();
            });
        });
        it('loads the token on each http subscription', function () {
            var HEADER_NAME = "JWT";
            var firstToken = angular2_jwt_test_helpers_1.encodeTestToken({ "sub": 123, "name": "first token" });
            var secondToken = angular2_jwt_test_helpers_1.encodeTestToken({ "sub": 345, "name": "second token" });
            var currentToken = firstToken;
            var usedTokens = [];
            var httpSpy = jasmine.createSpyObj('http', ['request']);
            httpSpy.request.and.callFake(function (req) {
                usedTokens.push(req.headers.get(HEADER_NAME).trim());
                return rxjs_1.Observable.of(null);
            });
            var authHttp = new angular2_jwt_1.AuthHttp(new angular2_jwt_1.AuthConfig({
                headerName: HEADER_NAME,
                headerPrefix: " ",
                tokenGetter: function () { return currentToken; }
            }), httpSpy);
            var observer = authHttp.request(new http_1.Request({ url: 'http://test.local' }));
            observer.subscribe(function () { });
            currentToken = secondToken;
            observer.subscribe(function () { });
            expect(httpSpy["request"]).toHaveBeenCalledTimes(2);
            expect(usedTokens).toEqual([firstToken, secondToken]);
        });
    });
});
//# sourceMappingURL=angular2-jwt.spec.js.map