import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EquipmentService, Equipment } from '../equipment.service';

@Component({
  selector: 'app-equipment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './equipment-dialog.component.html',
  styleUrls: ['./equipment-dialog.component.scss']
})
export class EquipmentDialogComponent {
  private fb = inject(FormBuilder);
  private equipmentService = inject(EquipmentService);
  private dialogRef = inject(MatDialogRef<EquipmentDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data: Equipment | null = inject(MAT_DIALOG_DATA);

  isEdit = !!this.data;

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    serialNumber: [this.data?.serialNumber || '', Validators.required],
    categoryId: [this.data?.categoryId || 1, Validators.required],
    status: [this.data?.status || 'available']
  });

  categories = [
    { id: 1, name: 'Electrónica' },
    { id: 2, name: 'Audiovisual' },
    { id: 3, name: 'Informática' }
  ];

  statuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'maintenance', label: 'Mantenimiento' }
  ];

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.isEdit && this.data) {
      this.equipmentService.update(this.data.id, payload as any).subscribe({
        next: () => {
          this.snackBar.open('Equipo actualizado', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.equipmentService.create(payload as any).subscribe({
        next: () => {
          this.snackBar.open('Equipo creado exitosamente', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 3000 })
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
