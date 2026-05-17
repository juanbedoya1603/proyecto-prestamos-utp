import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoanService } from '../loan.service';
import { EquipmentService, Equipment } from '../../equipments/equipment.service';
import { UserService, User } from '../../users/user.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-loan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './loan-dialog.component.html',
  styleUrls: ['./loan-dialog.component.scss']
})
export class LoanDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private equipmentService = inject(EquipmentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<LoanDialogComponent>);
  private snackBar = inject(MatSnackBar);

  availableEquipments = signal<Equipment[]>([]);
  minDate = new Date();
  isLoading = signal(false);
  
  users = signal<User[]>([]);
  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'admin' || role === 'superuser';
  });

  form = this.fb.group({
    userId: [null as number | null],
    equipmentId: [null as number | null, Validators.required],
    returnDate: [null as Date | null, Validators.required]
  });

  ngOnInit() {
    // Cargar equipos disponibles
    this.equipmentService.getAll().subscribe({
      next: (data) => {
        this.availableEquipments.set(data.filter(e => e.status === 'available'));
      }
    });

    // Cargar usuarios si el solicitante es administrador
    if (this.isAdmin()) {
      this.form.get('userId')?.setValidators(Validators.required);
      this.userService.getAll().subscribe({
        next: (data) => this.users.set(data)
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const val = this.form.value;
    const payload: { equipmentId: number; returnDate: string; userId?: number } = {
      equipmentId: val.equipmentId!,
      returnDate: val.returnDate!.toISOString()
    };

    if (this.isAdmin() && val.userId) {
      payload.userId = val.userId;
    }

    this.isLoading.set(true);

    this.loanService.create(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Préstamo creado exitosamente', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.message || 'Error al crear préstamo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
