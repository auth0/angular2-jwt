import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { JwtModule, JwtHelperService } from 'angular-jwt';

describe('Example HttpService: with simple based tokken getter', () => {
  let service: JwtHelperService;
  const tokenGetter = jasmine.createSpy('tokenGetter');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetter,
            allowedDomains: ['example-1.com', 'example-2.com', 'example-3.com'],
          },
        }),
      ],
    });
    service = TestBed.inject(JwtHelperService);
  });

  it('should return null when tokenGetter returns null', () => {
    tokenGetter.and.returnValue(null);

    expect(service.decodeToken()).toBeNull();
  });

  it('should throw an error when token contains less than 2 dots', () => {
    tokenGetter.and.returnValue('a.b');

    expect(() => service.decodeToken()).toThrow();
  });

  it('should throw an error when token contains more than 2 dots', () => {
    tokenGetter.and.returnValue('a.b.c.d');

    expect(() => service.decodeToken()).toThrow();
  });
});

describe('Example HttpService: with a promise based tokken getter', () => {
  let service: JwtHelperService;
  const tokenGetter = jasmine.createSpy('tokenGetter');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetter,
            allowedDomains: ['example-1.com', 'example-2.com', 'example-3.com'],
          },
        }),
      ],
    });
    service = TestBed.inject(JwtHelperService);
  });

  it('should return null when tokenGetter returns null', async () => {
    tokenGetter.and.resolveTo(null);

    await expectAsync(service.decodeToken()).toBeResolvedTo(null);
  });

  it('should throw an error when token contains less than 2 dots', async () => {
    tokenGetter.and.resolveTo('a.b');

    await expectAsync(service.decodeToken()).toBeRejected();
  });

  it('should throw an error when token contains more than 2 dots', async () => {
    tokenGetter.and.resolveTo('a.b.c.d');

    await expectAsync(service.decodeToken()).toBeRejected();
  });

  it('should return the token when tokenGetter returns a valid JWT', async () => {
    tokenGetter.and.resolveTo('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NjY2ODU4NjAsImV4cCI6MTY5ODIyMTg2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.lXrRPRZ8VNUpwBsT9fLPPO0p0BotQle4siItqg4LqLQ');

    await expectAsync(service.decodeToken()).toBeResolvedTo(jasmine.anything());
  });
});

