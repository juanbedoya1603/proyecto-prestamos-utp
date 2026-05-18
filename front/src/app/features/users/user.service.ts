import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://alb-prestamos-utp-56970636.us-east-1.elb.amazonaws.com/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
