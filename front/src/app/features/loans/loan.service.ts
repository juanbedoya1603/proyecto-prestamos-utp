import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Loan {
  id: number;
  userId: number;
  equipmentId: number;
  loanDate: string;
  returnDate: string;
  status: 'active' | 'returned' | 'overdue';
  observations?: string;
  user?: { id: number; name: string; email: string };
  equipment?: { id: number; name: string; serialNumber: string; status: string };
  createdAt?: string;
}

export interface LoanResponse {
  message: string;
  loan: Loan;
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://alb-prestamos-utp-56970636.us-east-1.elb.amazonaws.com/api/loans';

  getAll(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/my-loans`);
  }

  create(data: { equipmentId: number; returnDate: string; userId?: number }): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(this.apiUrl, data);
  }

  returnLoan(id: number, observations?: string): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(`${this.apiUrl}/${id}/return`, { observations });
  }
}
