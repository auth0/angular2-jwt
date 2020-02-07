import { TestBed } from '@angular/core/testing';

import { ExampleHttpService } from './example-http.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {JwtModule} from 'angular-jwt';

export function tokenGetter() {
  return 'SOME_TEST_TOKEN';
}

describe('ExampleHttpService', () => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetter
          }
        })
      ]
    });
    service = TestBed.get(ExampleHttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should add Authorisation header', () => {
    expect(service).toBeTruthy();
  });

  it('should set the correct auth token', () => {
    service.testRequest().subscribe(response => {
      expect(response).toBeTruthy();
    });

    const httpRequest = httpMock.expectOne(`/assets/example-resource.json`);

    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
    expect(httpRequest.request.headers.get('Authorization')).toEqual(`Bearer ${tokenGetter()}`);
  });

});
