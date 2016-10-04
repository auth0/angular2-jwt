export class Token {

    private _value: string = null;

    public get value(): string {
        return this._value;
    }
    constructor(value: string) {
        this._value = value;
        if (this._value == null) this._value = '';
    }

    public static get Empty(): Token {
        return new Token('');
    }

    public equals(token: Token): boolean {
        if(token.value === this.value) return true;
        return false;
    }
}