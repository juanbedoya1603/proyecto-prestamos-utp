import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EquipmentService, Equipment, Category } from '../equipment.service';

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
export class EquipmentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private equipmentService = inject(EquipmentService);
  private dialogRef = inject(MatDialogRef<EquipmentDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data: Equipment | null = inject(MAT_DIALOG_DATA);

  isEdit = !!this.data;

  // Señal para almacenar las categorías obtenidas dinámicamente
  categories = signal<Category[]>([]);
  isLoading = signal(false);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    serialNumber: [this.data?.serialNumber || '', Validators.required],
    categoryId: [this.data?.categoryId || null, Validators.required],
    status: [this.data?.status || 'available']
  });

  statuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'maintenance', label: 'Mantenimiento' }
  ];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.equipmentService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        // Si es modo creación y hay categorías disponibles, seleccionar la primera por defecto
        if (!this.isEdit && cats.length > 0 && !this.form.value.categoryId) {
          this.form.patchValue({ categoryId: cats[0].id as any });
        }
      },
      error: (err) => {
        this.snackBar.open('Error al cargar categorías desde la base de datos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.value as { name: string; serialNumber: string; categoryId: number; status: 'available' | 'borrowed' | 'maintenance' };
    this.isLoading.set(true);

    if (this.isEdit && this.data) {
      this.equipmentService.update(this.data.id, payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open('Equipo actualizado exitosamente', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar equipo', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.equipmentService.create(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.snackBar.open('Equipo creado exitosamente', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear equipo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
