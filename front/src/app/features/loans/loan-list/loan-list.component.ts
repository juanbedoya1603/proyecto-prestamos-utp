import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoanService, Loan } from '../loan.service';
import { LoanDialogComponent } from '../loan-dialog/loan-dialog.component';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss']
})
export class LoanListComponent implements OnInit {
  private loanService = inject(LoanService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loans = signal<Loan[]>([]);
  displayedColumns = ['id', 'equipment', 'user', 'loanDate', 'returnDate', 'status', 'actions'];

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loanService.getAll().subscribe({
      next: (data) => this.loans.set(data),
      error: () => this.snackBar.open('Error al cargar préstamos', 'Cerrar', { duration: 3000 })
    });
  }

  openNewLoan() {
    const dialogRef = this.dialog.open(LoanDialogComponent, { width: '480px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadLoans();
    });
  }

  returnLoan(loan: Loan) {
    if (!confirm(`¿Confirmar devolución del equipo "${loan.equipment?.name}"?`)) return;

    this.loanService.returnLoan(loan.id).subscribe({
      next: () => {
        this.snackBar.open('Equipo devuelto exitosamente', 'OK', { duration: 3000 });
        this.loadLoans();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al devolver', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      returned: 'Devuelto',
      overdue: 'Vencido'
    };
    return labels[status] || status;
  }
}
