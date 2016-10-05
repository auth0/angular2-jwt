import { Token } from "./token";
import { Base64 } from 'js-base64';

const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.m2OKoK5-Fnbbg4inMrsAQKsehq2wpQYim8695uLdogk";
const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU";
const noExpiryToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
const tokenFormatString = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{0}.m2OKoK5-Fnbbg4inMrsAQKsehq2wpQYim8695uLdogk";


describe("Token", () => {

    'use strict';

    it("constructor with null value should throw", () => {
        let createToken = function () { new Token(null); };
        expect(createToken).toThrow();
    });

    it("constructor with invalid format value should throw", () => {
        let createToken = function () { new Token('InvalidFormat'); };
        expect(createToken).toThrow();
    });

    it("constructor with blank value should throw", () => {
        let createToken = function () { new Token(''); };
        expect(createToken).toThrow();
    });

    it("with same value are equal", () => {
        let token1 = new Token(expiredToken);
        let token2 = new Token(expiredToken);
        expect(token1.equals(token2)).toBe(true);
    });

    it("with different value are not equal", () => {
        let token1 = new Token(expiredToken);
        let token2 = new Token(noExpiryToken);
        expect(token1.equals(token2)).toBe(false);
    });

    it("null is not a token", () => {
        expect(Token.isToken(null)).toBe(false);
    });

    it("blank string is not a token", () => {
        expect(Token.isToken('')).toBe(false);
    });

    it("null is not a token", () => {
        expect(Token.isToken(null)).toBe(false);
    });

     it("validtoken is a token", () => {
        expect(Token.isToken(validToken)).toBe(true);
    });

    describe("Payload", () => {

        const unexpiredObject = { name: "angular2", exp: 9999999999 };
        const expiredObject = { name: "angular2", exp: 10 };
        const expirelessObject = { name: "angular2" };

        it("with expireless instance should decode", () => {
            //arrange
            let ePayload = Base64.encode(JSON.stringify(expirelessObject));
            let tokenValue = tokenFormatString.replace('{0}', ePayload);
            const token = new Token(tokenValue);

            //act
            let payload = token.decodePayLoad();

            //assert
            expect(payload.name).toBe(expirelessObject.name);
            expect(payload.exp).toBeUndefined();
            expect(payload.getExpirationDate()).toBe(null);
            expect(payload.isExpired()).toBe(false);
        });

        it("with unexpired instance should decode", () => {
            let encoded = Base64.encode(JSON.stringify(unexpiredObject));
            let tokenValue = tokenFormatString.replace('{0}', encoded);
            const token = new Token(tokenValue);

             //act
            let payload = token.decodePayLoad();

            //assert
            expect(payload.name).toBe(unexpiredObject.name);
            expect(payload.exp).toBe(unexpiredObject.exp);
            expect(payload.isExpired()).toBe(false);
        });

        it("with expired instance should decode", () => {
            let encoded = Base64.encode(JSON.stringify(expiredObject));
            let tokenValue = tokenFormatString.replace('{0}', encoded);
            const token: Token = new Token(tokenValue);
            
            //act
            let payload = token.decodePayLoad();

            //assert
            expect(payload.name).toBe(expiredObject.name);
            expect(payload.exp).toBe(expiredObject.exp);
            expect(payload.isExpired()).toBe(true);
        });

    });

});

