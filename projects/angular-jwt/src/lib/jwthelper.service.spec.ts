import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { JwtModule, JwtHelperService } from 'angular-jwt';

describe('JwtHelperService: with simple based tokken getter', () => {
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

    tokenGetter.calls.reset();
  });

  describe('calling decodeToken', () => {
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

    it('should call the tokenGetter when no token passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result: any = service.decodeToken();

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should call the tokenGetter when undefined is passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result = service.decodeToken(undefined);

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.returnValue(null);

      const result = service.decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result = service.decodeToken('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('calling getTokenExpirationDate', () => {
    it('should call the tokenGetter when no token passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.getTokenExpirationDate() as Date;

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should call the tokenGetter when undefined is passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.getTokenExpirationDate(undefined) as Date;

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.returnValue(null);

      const result = service.getTokenExpirationDate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.getTokenExpirationDate('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('calling isTokenExpired', () => {
    it('should call the tokenGetter when no token passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.isTokenExpired() as Boolean;

      expect(tokenGetter).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should call the tokenGetter when undefined is passed', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.isTokenExpired(undefined);

      expect(tokenGetter).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.returnValue(null);

      const result = service.isTokenExpired('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.isTokenExpired('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });

});

describe('JwtHelperService: with a promise based tokken getter', () => {
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
    tokenGetter.calls.reset();
  });

  describe('calling decodeToken', () => {
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

    it('should call the tokenGetter when no token passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result = await service.decodeToken();

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should call the tokenGetter when undefined is passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result = await service.decodeToken(undefined);

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.resolveTo(null);

      const result = service.decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result.name).toBe('John Doe');
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      const result = service.decodeToken('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('calling getTokenExpirationDate', () => {
    it('should call the tokenGetter when no token passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = await service.getTokenExpirationDate();

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should call the tokenGetter when undefined is passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = await service.getTokenExpirationDate(undefined);

      expect(tokenGetter).toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.resolveTo(null);

      const result = service.getTokenExpirationDate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result.getFullYear()).toBe(2018);
      expect(result.getMonth() + 1).toBe(1);
      expect(result.getDate()).toBe(18);
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.getTokenExpirationDate('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('calling isTokenExpired', () => {
    it('should call the tokenGetter when no token passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = await service.isTokenExpired();

      expect(tokenGetter).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should call the tokenGetter when undefined is passed', async () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = await service.isTokenExpired(undefined);

      expect(tokenGetter).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should not call the tokenGetter when token passed', () => {
      tokenGetter.and.resolveTo(null);

      const result = service.isTokenExpired('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should not call the tokenGetter when token passed as empty string', () => {
      tokenGetter.and.resolveTo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ');

      const result = service.isTokenExpired('');

      expect(tokenGetter).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });
});

