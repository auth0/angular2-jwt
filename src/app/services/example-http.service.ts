import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExampleHttpService {

  constructor(private http: HttpClient) { }

  testRequest() {
    return this.http.get('/assets/example-resource.json');
  }
}
