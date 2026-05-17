import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { EquipmentService, Equipment } from '../equipments/equipment.service';
import { LoanService, Loan } from '../loans/loan.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private loanService = inject(LoanService);

  equipments = signal<Equipment[]>([]);
  loans = signal<Loan[]>([]);

  // Señales calculadas de forma reactiva
  totalEquipments = computed(() => this.equipments().length);
  availableEquipments = computed(() => this.equipments().filter(e => e.status === 'available').length);
  borrowedEquipments = computed(() => this.equipments().filter(e => e.status === 'borrowed').length);
  activeLoans = computed(() => this.loans().filter(l => l.status === 'active').length);

  recentLoans = computed(() => this.loans().slice(0, 5));
  displayedColumns = ['equipment', 'user', 'date', 'status'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.equipmentService.getAll().subscribe({
      next: (data) => {
        this.equipments.set(data);
      }
    });

    this.loanService.getAll().subscribe({
      next: (data) => {
        this.loans.set(data);
      }
    });
  }
}

