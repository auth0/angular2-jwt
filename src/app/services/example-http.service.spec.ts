import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ExampleHttpService } from './example-http.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JwtModule } from 'angular-jwt';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const TEST_TOKEN_1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.cMErWtEf7DxCXJl8C9q0L7ttkm-Ex54UWHsOCMGbtUc';
const TEST_TOKEN_2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikphc29uIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.f2z_alWh9QWCkPHtAdVMRlZOb_2krfZ1wd78Bj2_YEg';

export function tokenGetter() {
  return TEST_TOKEN;
}

export function tokenGetterWithRequest(request) {
  if (request.url.includes('1')) {
    return TEST_TOKEN_1;
  }

  if (request.url.includes('2')) {
    return TEST_TOKEN_2;
  }

  return TEST_TOKEN;
}

export function tokenGetterWithPromise() {
  return Promise.resolve(TEST_TOKEN);
}

describe('Example HttpService: with promise based tokken getter', () => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const validRoutes = [
    `/assets/example-resource.json`,
    `http://allowed.com/api/`,
    `http://allowed.com/api/test`,
    `http://allowed.com:443/api/test`,
    `http://allowed-regex.com/api/`,
    `https://allowed-regex.com/api/`,
    `http://localhost:3000`,
    `http://localhost:3000/api`,
  ];
  const invalidRoutes = [
    `http://allowed.com/api/disallowed`,
    `http://allowed.com/api/disallowed-protocol`,
    `http://allowed.com:80/api/disallowed-protocol`,
    `http://allowed.com/api/disallowed-regex`,
    `http://allowed-regex.com/api/disallowed-regex`,
    `http://foo.com/bar`,
    'http://localhost/api',
    'http://localhost:4000/api',
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetterWithPromise,
            allowedDomains: ['allowed.com', /allowed-regex*/, 'localhost:3000'],
            disallowedRoutes: [
              'http://allowed.com/api/disallowed-protocol',
              '//allowed.com/api/disallowed',
              /disallowed-regex*/,
            ],
          },
        }),
      ],
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should add Authorisation header', () => {
    expect(service).toBeTruthy();
  });

  validRoutes.forEach((route) =>
    it(`should set the correct auth token for a allowed domain: ${route}`, fakeAsync(() => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      flush();
      const httpRequest = httpMock.expectOne(route);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
      expect(httpRequest.request.headers.get('Authorization')).toEqual(
        `Bearer ${TEST_TOKEN}`
      );
    }))
  );

  invalidRoutes.forEach((route) =>
    it(`should not set the auth token for a disallowed route: ${route}`, fakeAsync(() => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      flush();
      const httpRequest = httpMock.expectOne(route);
      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
    })
  ));
});

describe('Example HttpService: with simple tokken getter', () => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const validRoutes = [
    `/assets/example-resource.json`,
    `http://allowed.com/api/`,
    `http://allowed.com/api/test`,
    `http://allowed.com:443/api/test`,
    `http://allowed-regex.com/api/`,
    `https://allowed-regex.com/api/`,
    `http://localhost:3000`,
    `http://localhost:3000/api`,
  ];
  const invalidRoutes = [
    `http://allowed.com/api/disallowed`,
    `http://allowed.com/api/disallowed-protocol`,
    `http://allowed.com:80/api/disallowed-protocol`,
    `http://allowed.com/api/disallowed-regex`,
    `http://allowed-regex.com/api/disallowed-regex`,
    `http://foo.com/bar`,
    'http://localhost/api',
    'http://localhost:4000/api',
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetter,
            allowedDomains: ['allowed.com', /allowed-regex*/, 'localhost:3000'],
            disallowedRoutes: [
              'http://allowed.com/api/disallowed-protocol',
              '//allowed.com/api/disallowed',
              /disallowed-regex*/,
            ],
          },
        }),
      ],
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should add Authorisation header', () => {
    expect(service).toBeTruthy();
  });

  validRoutes.forEach((route) =>
    it(`should set the correct auth token for a allowed domain: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
      expect(httpRequest.request.headers.get('Authorization')).toEqual(
        `Bearer ${tokenGetter()}`
      );
    })
  );

  invalidRoutes.forEach((route) =>
    it(`should not set the auth token for a disallowed route: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);
      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
    })
  );
});

describe('Example HttpService: with request based tokken getter', () => {
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
            allowedDomains: ['example-1.com', 'example-2.com', 'example-3.com'],
          },
        }),
      ],
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should add Authorisation header', () => {
    expect(service).toBeTruthy();
  });

  routes.forEach((route) =>
    it(`should set the correct auth token for a domain: ${route}`, () => {
      service.testRequest(route).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne(route);
      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
      expect(httpRequest.request.headers.get('Authorization')).toEqual(
        `Bearer ${tokenGetterWithRequest({ url: route })}`
      );
    })
  );
});

const authSchemes = [
  [undefined, 'Bearer '],
  ['Basic ', 'Basic '],
  [() => 'Basic ', 'Basic '],
];

authSchemes.forEach((scheme) => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  describe(`Example HttpService: with ${
    typeof scheme[0] === 'function'
      ? 'an authscheme getter function'
      : 'a simple authscheme getter'
  }`, () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              authScheme: scheme[0],
              allowedDomains: ['allowed.com'],
            },
          }),
        ],
      });
      service = TestBed.get(ExampleHttpService);
      httpMock = TestBed.get(HttpTestingController);
    });

    it(`should set the correct auth scheme a request (${scheme[1]})`, () => {
      service.testRequest('http://allowed.com').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpMock.expectOne('http://allowed.com');
      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
      expect(httpRequest.request.headers.get('Authorization')).toEqual(
        `${scheme[1]}${tokenGetter()}`
      );
    });
  });
});
