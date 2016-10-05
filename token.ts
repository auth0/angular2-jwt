import {JwtHelper} from "./angular2-jwt";

export class Token {

    private _value: string = null;
    private _payload: IPayload = null;

    public get value(): string {
        return this._value;
    }

    constructor(value: string) {

        Token._decodeInternal(value);
        this._value = value;
    }

    public static isToken(value: string): boolean {
        try {
            Token._decodeInternal(value);
            return true;
        }
        catch (e) {
        };
        return false;
    }

    public equals(token: Token): boolean {
        if (token.value === this.value) return true;
        return false;
    }

    public decodePayLoad(): any {
        return this._payload = this._payload || Token._decodeInternal(this._value);
    }

    private static _decodeInternal(value: string): IPayload {

        let parts = value.split('.');

        if (parts.length !== 3) {
        throw new Error('Failed to decode. A JWT token must contain 3 parts.');
        }

        let decoded = new JwtHelper().urlBase64Decode(parts[1]);
        if (!decoded) {
        throw new Error('Failed to decode. The token must be base64 encoded.');
        }

        var instance = JSON.parse(decoded);
        this.makePayLoadImplementation(instance);
        return instance;
    }

    private static makePayLoadImplementation(instance: any) {
        instance.getExpirationDate = function() {
            if (!instance.hasOwnProperty('exp')) {
                        return null;
                }
                let date = new Date(0); // The 0 here is the key, which sets the date to the epoch
                date.setUTCSeconds(instance.exp);

                return date;
            };
        instance.isExpired = function(offsetSeconds?: number) {
            let date = instance.getExpirationDate();
            offsetSeconds = offsetSeconds || 0;

            if (date == null) {
                return false;
            }

            // Token expired?
            return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
        };
    };
}

interface IPayload {
    exp: string;
    getExpirationDate(): boolean;
}