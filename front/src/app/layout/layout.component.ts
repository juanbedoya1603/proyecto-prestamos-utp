import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, UserSession } from '../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  authService = inject(AuthService);

  get userName(): string {
    return this.authService.currentUser()?.name || 'Admin';
  }

  get userRole(): string {
    return this.authService.currentUser()?.role || 'superuser';
  }
  private router = inject(Router);

  collapsed = signal(false);

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'devices', label: 'Equipos', route: '/equipments' },
    { icon: 'assignment', label: 'Préstamos', route: '/loans' }
  ];

  toggleSidenav() {
    this.collapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
