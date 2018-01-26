"use strict";
function encodeTestToken(payload) {
    //don't actually check or care about the header or signature in angular2-jwt
    return "." + btoa(JSON.stringify(payload)) + ".";
}
exports.encodeTestToken = encodeTestToken;
//# sourceMappingURL=angular2-jwt-test-helpers.js.map