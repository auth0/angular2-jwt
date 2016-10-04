import { Token } from "./token";

describe("Token", () => {

    'use strict';

    it("constructor should set value", () => {
        const value = 'dGVzdA==';
        let token = new Token(value);
        expect(token.value).toBe(value);
    });

    it("constructor with null should default to empty string", () => {
        let token = new Token(null);
        expect(token.value).toBe('');
    });

    it("token with same value are equal", () => {
        let token1 = new Token('AA==');
        let token2 = new Token('AA==');
        expect(token1.equals(token2)).toBe(true);
    });

    it("token with different value are not equal", () => {
        let token1 = new Token('AA==');
        let token2 = new Token('ZZ==');
        expect(token1.equals(token2)).toBe(false);
    });

    it("token with null value equals to empty token", () => {
        let token1 = new Token(null);
        expect(token1.equals(Token.Empty)).toBe(true);
    });

    it("token with blank value equals to empty token", () => {
        let token1 = new Token('');
        expect(token1.equals(Token.Empty)).toBe(true);
    });

    

});

describe("Empty Token", () => {

    'use strict';

    it("should have empty value", () => {
        expect(Token.Empty.value).toBe('');
    });

});