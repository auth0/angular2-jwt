import { TestBed } from "@angular/core/testing";
import { ExampleHttpService } from "./example-http.service";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { JwtModule } from "angular-jwt";

export function tokenGetter() {
  return "TEST_TOKEN";
}

export function tokenGetterWithRequest(request) {
  if (request.url.includes("1")) {
    return "TEST_TOKEN_1";
  }

  if (request.url.includes("2")) {
    return "TEST_TOKEN_2";
  }

  return "TEST_TOKEN";
}

describe("Example HttpService: with simple tokken getter", () => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const validRoutes = [
    `/assets/example-resource.json`,
    `http://whitelisted.com/api/`,
    `http://whitelisted.com/api/test`,
    `http://whitelisted.com:443/api/test`,
    `http://whitelisted-regex.com/api/`,
    `https://whitelisted-regex.com/api/`,
  ];
  const invalidRoutes = [
    `http://whitelisted.com/api/blacklisted`,
    `http://whitelisted.com/api/blacklisted-protocol`,
    `http://whitelisted.com:80/api/blacklisted-protocol`,
    `http://whitelisted.com/api/blacklisted-regex`,
    `http://whitelisted-regex.com/api/blacklisted-regex`,
    `http://foo.com/bar`,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetter,
            whitelistedDomains: ["whitelisted.com", /whitelisted-regex*/],
            blacklistedRoutes: [
              "http://whitelisted.com/api/blacklisted-protocol",
              "//whitelisted.com/api/blacklisted",
              /blacklisted-regex*/,
            ],
          },
        }),
      ],
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it("should add Authorisation header", () => {
    expect(service).toBeTruthy();
  });

  validRoutes.forEach((route) =>
    it(`should set the correct auth token for a whitelisted domain: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);

      expect(httpRequest.request.headers.has("Authorization")).toEqual(true);
      expect(httpRequest.request.headers.get("Authorization")).toEqual(
        `Bearer ${tokenGetter()}`
      );
    })
  );

  invalidRoutes.forEach((route) =>
    it(`should not set the auth token for a blacklisted route: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);
      expect(httpRequest.request.headers.has("Authorization")).toEqual(false);
    })
  );
});

describe("Example HttpService: with request based tokken getter", () => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const routes = [
    `http://example-1.com/api/`,
    `http://example-2.com/api/`,
    `http://example-3.com/api/`,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetterWithRequest,
            whitelistedDomains: [
              "example-1.com",
              "example-2.com",
              "example-3.com",
            ],
          },
        }),
      ],
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it("should add Authorisation header", () => {
    expect(service).toBeTruthy();
  });

  routes.forEach((route) =>
    it(`should set the correct auth token for a domain: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);
      expect(httpRequest.request.headers.has("Authorization")).toEqual(true);
      expect(httpRequest.request.headers.get("Authorization")).toEqual(
        `Bearer ${tokenGetterWithRequest({ url: route })}`
      );
    })
  );
});
