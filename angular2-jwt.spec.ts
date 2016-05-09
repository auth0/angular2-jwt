import "core-js";
import {AuthConfig} from "./angular2-jwt";
import {tokenNotExpired} from "./angular2-jwt";
import {JwtHelper} from "./angular2-jwt";


const expiredToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.m2OKoK5-Fnbbg4inMrsAQKsehq2wpQYim8695uLdogk";
const validToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU";
const noExpiryToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M";

describe('AuthConfig', ()=> {
    'use strict';

    it('should have default values', ()=> {
        const config = new AuthConfig().getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe("Authorization");
        expect(config.headerPrefix).toBe("Bearer ");
        expect(config.tokenName).toBe("id_token");
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

});

describe('JwtHelper', ()=> {
    'use strict';
    describe('urlBase64Decode',()=>{
        
    });
    describe('decodeToken',()=>{

    });
    describe('getTokenExpirationDate',()=>{

    });
    describe('isTokenExpired',()=>{
        let jwtHelper:JwtHelper;
        beforeEach(()=>{
            jwtHelper=new JwtHelper();
        });
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
        localStorage.setItem("id_token", validToken);
        const actual:boolean=tokenNotExpired();
        expect(actual).toBe(true);
    });
    it('should use the defaults when expired', ()=> {
        localStorage.setItem("id_token", expiredToken);
        const actual:boolean=tokenNotExpired();
        expect(actual).toBe(false);
    });

});
