import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipment {
  id: number;
  name: string;
  serialNumber: string;
  status: 'available' | 'borrowed' | 'maintenance';
  categoryId: number;
  category?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/equipments';

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.apiUrl);
  }

  create(data: { name: string; serialNumber: string; categoryId: number }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: Partial<Equipment>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
