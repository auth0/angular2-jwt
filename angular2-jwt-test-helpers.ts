export function encodeTestToken(payload:any):string{
    //don't actually check or care about the header or signature in angular2-jwt
    return "."+btoa(JSON.stringify(payload))+".";
}