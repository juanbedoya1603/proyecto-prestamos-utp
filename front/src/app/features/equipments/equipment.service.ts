import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Añadir esta interfaz
export interface Category {
  id: number;
  name: string;
  description?: string;
}

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

export interface EquipmentResponse {
  message: string;
  equipment?: Equipment;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/equipments';
  // Añadir la URL de categorías
  private readonly catUrl = 'http://localhost:3000/api/categories';

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.apiUrl);
  }

  // Añadir este nuevo método
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.catUrl);
  }

  create(data: { name: string; serialNumber: string; categoryId: number }): Observable<EquipmentResponse> {
    return this.http.post<EquipmentResponse>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Equipment>): Observable<EquipmentResponse> {
    return this.http.put<EquipmentResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<EquipmentResponse> {
    return this.http.delete<EquipmentResponse>(`${this.apiUrl}/${id}`);
  }
}
