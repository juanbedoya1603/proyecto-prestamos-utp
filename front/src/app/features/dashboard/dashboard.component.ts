import { Component, inject, signal, OnInit } from '@angular/core';
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

  totalEquipments = signal(0);
  availableEquipments = signal(0);
  borrowedEquipments = signal(0);
  activeLoans = signal(0);

  recentLoans = signal<Loan[]>([]);
  displayedColumns = ['equipment', 'user', 'date', 'status'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.equipmentService.getAll().subscribe({
      next: (data) => {
        this.equipments.set(data);
        this.totalEquipments.set(data.length);
        this.availableEquipments.set(data.filter(e => e.status === 'available').length);
        this.borrowedEquipments.set(data.filter(e => e.status === 'borrowed').length);
      }
    });

    this.loanService.getAll().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.activeLoans.set(data.filter(l => l.status === 'active').length);
        this.recentLoans.set(data.slice(0, 5));
      }
    });
  }
}
