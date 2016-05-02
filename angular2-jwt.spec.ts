import "core-js";
import {AuthConfig} from "./angular2-jwt";
import {tokenNotExpired} from "./angular2-jwt";


const expiredToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6IjAifQ.bI_ajkRYn0SEmI395jyFEwuDtGVcxLvlaqwrjT5iAEs";
const validToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6Ijk5OTk5OTk5OTkifQ.1zjdR8DnnoN6AQI6LSwmoBP1IoYmA4b2WSvV7b5SaQE";


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
