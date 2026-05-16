import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EquipmentService, Equipment } from '../equipment.service';
import { EquipmentDialogComponent } from '../equipment-dialog/equipment-dialog.component';

@Component({
  selector: 'app-equipment-list',
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
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.scss']
})
export class EquipmentListComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  equipments = signal<Equipment[]>([]);
  displayedColumns = ['id', 'name', 'serialNumber', 'category', 'status', 'actions'];

  ngOnInit() {
    this.loadEquipments();
  }

  loadEquipments() {
    this.equipmentService.getAll().subscribe({
      next: (data) => this.equipments.set(data),
      error: () => this.snackBar.open('Error al cargar equipos', 'Cerrar', { duration: 3000 })
    });
  }

  openDialog(equipment?: Equipment) {
    const dialogRef = this.dialog.open(EquipmentDialogComponent, {
      width: '480px',
      data: equipment || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadEquipments();
    });
  }

  deleteEquipment(eq: Equipment) {
    if (!confirm(`¿Estás seguro de eliminar "${eq.name}"?`)) return;

    this.equipmentService.delete(eq.id).subscribe({
      next: () => {
        this.snackBar.open('Equipo eliminado exitosamente', 'OK', { duration: 3000 });
        this.loadEquipments();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Disponible',
      borrowed: 'Prestado',
      maintenance: 'Mantenimiento'
    };
    return labels[status] || status;
  }
}
