# Change log

## Version [3.0.1](https://github.com/auth0/angular2-jwt/tags/v3.0.1) (2019-10-28)

[Full Changelog](https://github.com/auth0/angular2-jwt/compare/3.0.0..3.0.1)

- Be sure to handle `undefined` tokens [\#626](https://github.com/auth0/angular2-jwt/pull/626) [@RobertRad](https://github.com/RobertRad)
- docs: corrected/rephrased a sentence in README.md [\#625](https://github.com/auth0/angular2-jwt/pull/625) [@noopur-tiwari](https://github.com/noopur-tiwari)

## Version [3.0.0](https://github.com/auth0/angular2-jwt/releases/tag/3.0.0) (2019-07-16)

[Full Changelog](https://github.com/auth0/angular2-jwt/compare/2.1.2..3.0.0)

- **Breaking change** `isTokenExpired` now returns `false` if no expiry date is found inside the token. This is a change to align with the [JWT spec](https://tools.ietf.org/html/rfc7519#section-4.1.4), but may break applications that rely on the previous behavior. [#562](https://github.com/auth0/angular2-jwt/pull/562) [@atom-morgan](https://github.com/atom-morgan)

## Version [2.1.2](https://github.com/auth0/angular2-jwt/releases/tag/2.1.2) (2019-07-15)

[Full Changelog](https://github.com/auth0/angular2-jwt/compare/2.1.1..2.1.2)

- Gracefully handle null/empty tokens [#586](https://github.com/auth0/angular2-jwt/pull/586)

## Version [2.1.1](https://github.com/auth0/angular2-jwt/releases/tag/2.1.1) (2019-07-01)

[Full Changelog](https://github.com/auth0/angular2-jwt/compare/2.1.0...2.1.1)

- Blacklist/Whitelist check fix [#538](https://github.com/auth0/angular2-jwt/pull/538)
- Refactor deep rxjs imports and use named define [#608](https://github.com/auth0/angular2-jwt/pull/608)
- fix(rxjs): remove imports from rxjs/internal [#542](https://github.com/auth0/angular2-jwt/pull/542)

> Note: historical changelog information has not been recorded in this format. Please see the [releases page](https://github.com/auth0/angular2-jwt/releases) for information on previous releases.
