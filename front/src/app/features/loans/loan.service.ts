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

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/loans';

  getAll(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/my-loans`);
  }

  create(data: { equipmentId: number; returnDate: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  returnLoan(id: number, observations?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/return`, { observations });
  }
}
