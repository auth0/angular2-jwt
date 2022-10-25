## API reference

- [JwtModule configuration options](#jwtmodule-configuration-options)
- [JwtHelperService](#jwthelperservice)

### `JwtModule` configuration options

#### `tokenGetter: function(HttpRequest): string`

The `tokenGetter` is a function which returns the user's token. This function simply needs to make a retrieval call to wherever the token is stored. In many cases, the token will be stored in local storage or session storage.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    tokenGetter: () => {
      return localStorage.getItem("access_token");
    },
  },
});
```

If you have multiple tokens for multiple domains, you can use the `HttpRequest` passed to the `tokenGetter` function to get the correct token for each intercepted request.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    tokenGetter: (request) => {
      if (request.url.includes("foo")) {
        return localStorage.getItem("access_token_foo");
      }

      return localStorage.getItem("access_token");
    },
  },
});
```

#### `allowedDomains: array`

Authenticated requests should only be sent to domains you know and trust. Many applications make requests to APIs from multiple domains, some of which are not controlled by the developer. Since there is no way to know what the API being called will do with the information contained in the request, it is best to not send the user's token to all APIs in a blind fashion.

List any domains you wish to allow authenticated requests to be sent to by specifying them in the `allowedDomains` array. **Note that standard http port 80 and https port 443 requests don't require a port to be specified. A port is only required in the allowed domains host name if you are authenticating against a non-standard port e.g. localhost:3001**

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    allowedDomains: ["localhost:3001", "foo.com", "bar.com"],
  },
});
```

#### `disallowedRoutes: array`

If you do not want to replace the authorization headers for specific routes, list them here. This can be useful if your
initial auth route(s) are on an allowed domain and take basic auth headers. These routes need to be prefixed with the correct protocol (`http://`, `https://`). If you want to add a route to the list of disallowed routes regardless of the protocol, you can prefix it with `//`.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    disallowedRoutes: [
      "http://localhost:3001/auth/",
      "https://foo.com/bar/",
      "//foo.com/bar/baz",
      /localhost:3001\/foo\/far.*/,
    ], // strings and regular expressions
  },
});
```

**Note:** If requests are sent to the same domain that is serving your Angular application, you do not need to add that domain to the `allowedDomains` array. However, this is only the case if you don't specify the domain in the `Http` request.

For example, the following request assumes that the domain is the same as the one serving your app. It doesn't need to be allowed in this case.

```ts
this.http.get('/api/things')
  .subscribe(...)
```

However, if you are serving your API at the same domain as that which is serving your Angular app **and** you are specifying that domain in `Http` requests, then it **does** need to be explicitely allowed.

```ts
// Both the Angular app and the API are served at
// localhost:4200 but because that domain is specified
// in the request, it must be allowed
this.http.get('http://localhost:4200/api/things')
  .subscribe(...)
```

#### `headerName: string`

The default header name is `Authorization`. This can be changed by specifying a custom `headerName` which is to be a string value.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    headerName: "Your Header Name",
  },
});
```

#### `authScheme: string | function(HttpRequest): string`

The default authorization scheme is `Bearer` followed by a single space. This can be changed by specifying a custom `authScheme`. You can pass a string which will prefix the token for each request.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    authScheme: "Basic ",
  },
});
```

If you want to change the auth scheme dynamically, or based on the request, you can configure a getter function which returns a string.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    authScheme: (request) => {
      if (request.url.includes("foo")) {
        return "Basic ";
      }

      return "Bearer ";
    },
  },
});
```

#### `throwNoTokenError: boolean`

Setting `throwNoTokenError` to `true` will result in an error being thrown if a token cannot be retrieved with the `tokenGetter` function. Defaults to `false`.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    throwNoTokenError: true,
  },
});
```

#### `skipWhenExpired: boolean`

By default, the user's JWT will be sent in `HttpClient` requests even if it is expired. You may choose to not allow the token to be sent if it is expired by setting `skipWhenExpired` to true.

```ts
// ...
JwtModule.forRoot({
  config: {
    // ...
    skipWhenExpired: true,
  },
});
```

### `JwtHelperService`

This service contains helper functions:

#### isTokenExpired (old tokenNotExpired function)

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.isTokenExpired()); // true or false
}
```

#### getTokenExpirationDate

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.getTokenExpirationDate()); // date
}
```

#### decodeToken

```ts
import { JwtHelperService } from '@auth0/angular-jwt';
// ...
constructor(public jwtHelper: JwtHelperService) {}

ngOnInit() {
  console.log(this.jwtHelper.decodeToken(token)); // token
}
```
