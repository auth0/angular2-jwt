import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExampleHttpService {
  constructor(private http: HttpClient) {}

  testRequest(route = '/assets/example-resource.json') {
    return this.http.get(route);
  }
}
