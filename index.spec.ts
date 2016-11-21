import "core-js";
import {AuthConfig, AuthHttp, tokenIsPresent} from "./index";
import {Observable} from "rxjs";

const validToken="vrPUTkACk5O5FkIRtOTXzHKx";
const emptyToken="    ";
const nullToken:string=null;
const undefinedToken:string=undefined;
describe('AuthConfig', ()=> {
    'use strict';

    it('should have default values', ()=> {
        const config = new AuthConfig().getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe("Authorization");
        expect(config.headerPrefix).toBe("Bearer ");
        expect(config.tokenName).toBe("access_token");
        expect(config.noTokenError).toBe(false);
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
            noTokenError: true,
            globalHeaders: [{"header": "value"}, {"header2": "value2"}],
            noTokenScheme: true
        };
        const config = new AuthConfig(configExpected).getConfig();
        expect(config).toBeDefined();
        expect(config.headerName).toBe(configExpected.headerName);
        expect(config.headerPrefix).toBe(configExpected.headerPrefix + " ");
        expect(config.tokenName).toBe(configExpected.tokenName);
        expect(config.noTokenError).toBe(configExpected.noTokenError);
        expect(config.noTokenScheme).toBe(configExpected.noTokenScheme);
        expect(config.globalHeaders).toEqual(configExpected.globalHeaders);
        expect(config.tokenGetter).toBeDefined();
        expect(config.tokenGetter()).toBe("this is a token");
    });

});

describe('tokenIsPresent', ()=> {
    'use strict';
    it('should use the passed token when present', ()=> {
        const actual:boolean=tokenIsPresent(null,validToken);
        expect(actual).toBe(true);
    });
    it('should use the passed token when empty', ()=> {
        const actual:boolean=tokenIsPresent(null,emptyToken);
        expect(actual).toBe(false);
    });
    it('should use the passed token when null', ()=> {
        const actual:boolean=tokenIsPresent(null,nullToken);
        expect(actual).toBe(false);
    });
    it('should use the passed token when undefined', ()=> {
        const actual:boolean=tokenIsPresent(null,undefinedToken);
        expect(actual).toBe(false);
    });
    it('should use the passed tokenName when present', ()=> {
        localStorage.setItem("Valid", validToken);
        const actual:boolean=tokenIsPresent("Valid");
        expect(actual).toBe(true);
    });
    it('should use the passed tokenName when empty', ()=> {
        localStorage.setItem("Empty", emptyToken);
        const actual:boolean=tokenIsPresent("Empty");
        expect(actual).toBe(false);
    });
    it('should use the passed tokenName when null', ()=> {
        localStorage.setItem("Null", emptyToken);
        const actual:boolean=tokenIsPresent("Null");
        expect(actual).toBe(false);
    });
    it('should use the passed tokenName when undefined', ()=> {
        localStorage.setItem("Undefined", emptyToken);
        const actual:boolean=tokenIsPresent("Undefined");
        expect(actual).toBe(false);
    });
    it('should use the defaults when present', ()=> {
        localStorage.setItem("access_token", validToken);
        const actual:boolean=tokenIsPresent();
        expect(actual).toBe(true);
    });
    it('should use the defaults when missing', ()=> {
        localStorage.removeItem("access_token");
        const actual:boolean=tokenIsPresent();
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

            authHttp.request(null);

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
    });
});
