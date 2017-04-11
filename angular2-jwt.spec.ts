import "core-js";
import {AuthConfig, AuthHttp, tokenNotExpired, JwtHelper} from "./angular2-jwt";
import {Observable} from "rxjs";
import {encodeTestToken} from "./angular2-jwt-test-helpers";
import {Request} from '@angular/http';



const expiredToken=encodeTestToken({
    "exp": 0
});
const validToken=encodeTestToken({
    "exp": 9999999999
});
const noExpiryToken=encodeTestToken({
    "sub": "1234567890",
    "name": "John Doe",
    "admin": true
});

describe('AuthConfig', ()=> {
    'use strict';

    it('should have default values', ()=> {
        const config = new AuthConfig().getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe("Authorization");
        expect(config.headerPrefix).toBe("Bearer ");
        expect(config.tokenName).toBe("token");
        expect(config.noJwtError).toBe(false);
        expect(config.noTokenScheme).toBe(false);
        expect(config.globalHeaders).toEqual([]);
        expect(config.tokenGetter).toBeDefined();
        const token = "Token";
        localStorage.setItem(config.tokenName, token);
        expect(config.tokenGetter()).toBe(token);
    });

    it('should have default values', ()=> {
        const configExpected = {
            headerName: "Foo",
            headerPrefix: "Bar",
            tokenName: "token",
            tokenGetter: ()=>"this is a token",
            noJwtError: true,
            globalHeaders: [{"header": "value"}, {"header2": "value2"}],
            noTokenScheme: true
        };
        const config = new AuthConfig(configExpected).getConfig();
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
    
    it('should use custom token name in default tokenGetter', ()=> {
      const configExpected = { tokenName: 'Token' };
      const token = 'token';
      const config = new AuthConfig(configExpected).getConfig();
      localStorage.setItem(configExpected.tokenName, token);
      expect(config).toBeDefined();
      expect(config.tokenName).toBe(configExpected.tokenName);
      expect(config.tokenGetter()).toBe(token);
    });

});

describe('JwtHelper', ()=> {
    'use strict';
    let jwtHelper:JwtHelper;
    beforeEach(()=>{
        jwtHelper=new JwtHelper();
    });
    describe('urlBase64Decode',()=>{
        it('should successfully decode payloads with funny symbols (A Euro symbol in this case) simplified',()=>{
            const expected="€";
            const payload="4oKs"
            const actual:any=jwtHelper.urlBase64Decode(payload);
            expect(actual).toBe(expected);
        });
    });
    describe('decodeToken',()=>{
        it('should handle a valid token', ()=> {
            const payload = {
                exp: 0
            };
            const token = encodeTestToken(payload);
            const actual = jwtHelper.decodeToken(token);
            expect(actual).toEqual(payload);
        });
    });
    describe('getTokenExpirationDate',()=>{

    });
    describe('isTokenExpired',()=>{
        it('should return false when the token is not expired', ()=> {
            const actual:boolean=jwtHelper.isTokenExpired(validToken);
            expect(actual).toBe(false);
        });
        it('should return true when the token is expired', ()=> {
            const actual:boolean=jwtHelper.isTokenExpired(expiredToken);
            expect(actual).toBe(true);
        });
        it('should return false when the token doesn\'t have an expiry date', ()=> {
            const actual:boolean=jwtHelper.isTokenExpired(noExpiryToken);
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

describe('tokenNotExpired', ()=> {
    'use strict';
    it('should use the passed token when not expired', ()=> {
        const actual:boolean=tokenNotExpired(null,validToken);
        expect(actual).toBe(true);
    });
    it('should use the passed token when expired', ()=> {
        const actual:boolean=tokenNotExpired(null,expiredToken);
        expect(actual).toBe(false);
    });
    it('should use the passed tokenName when not expired', ()=> {
        localStorage.setItem("Valid", validToken);
        const actual:boolean=tokenNotExpired("Valid");
        expect(actual).toBe(true);
    });
    it('should use the passed tokenName when expired', ()=> {
        localStorage.setItem("Expired", expiredToken);
        const actual:boolean=tokenNotExpired("Expired");
        expect(actual).toBe(false);
    });
    it('should use the defaults when not expired', ()=> {
        localStorage.setItem("token", validToken);
        const actual:boolean=tokenNotExpired();
        expect(actual).toBe(true);
    });
    it('should use the defaults when expired', ()=> {
        localStorage.setItem("token", expiredToken);
        const actual:boolean=tokenNotExpired();
        expect(actual).toBe(false);
    });

});

describe("AuthHttp", () => {
    describe("request", () => {
        it("handles tokenGetters returning string", () => {
            let authHttp: AuthHttp = new AuthHttp(new AuthConfig({
                tokenGetter: () => validToken
            }), null);

            spyOn(authHttp, "requestWithToken").and.stub();

            authHttp.request(null).subscribe();

            expect(authHttp["requestWithToken"]).toHaveBeenCalledWith(null, validToken);
        });

        it("handles tokenGetters returning Promise\<string\>", (done: Function) => {
            let authHttp: AuthHttp = new AuthHttp(new AuthConfig({
                tokenGetter: () => Promise.resolve(validToken)
            }), null);

            spyOn(authHttp, "requestWithToken").and.returnValue(Observable.of(""));

            authHttp.request(null).subscribe(() => {
                expect(authHttp["requestWithToken"]).toHaveBeenCalledWith(null, validToken);
                done();
            });
        });

        it('loads the token on each http subscription', () => {
            const HEADER_NAME = "JWT";
            let firstToken = encodeTestToken({ "sub": 123, "name": "first token"});
            let secondToken = encodeTestToken({ "sub": 345, "name": "second token"});
            let currentToken = firstToken;

            let usedTokens: string[] = [];

            let httpSpy = jasmine.createSpyObj('http', [ 'request' ]);
            httpSpy.request.and.callFake((req: Request) => {
                usedTokens.push(req.headers.get(HEADER_NAME).trim());
                return Observable.of(null);
            });

            let authHttp = new AuthHttp(new AuthConfig({
                headerName: HEADER_NAME,
                headerPrefix: " ",
                tokenGetter: () => currentToken
            }), httpSpy);

            let observer = authHttp.request(new Request({url: 'http://test.local'}));
            observer.subscribe(() => {});
            currentToken = secondToken;
            observer.subscribe(() => {});

            expect(httpSpy["request"]).toHaveBeenCalledTimes(2);
            expect(usedTokens).toEqual([firstToken, secondToken]);
        });
    });
});
