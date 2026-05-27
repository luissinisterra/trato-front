import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationBellComponent],
  template: `
    <header class="glass sticky top-0 z-40 h-16 flex items-center px-4 md:px-8 border-b border-border transition-colors">
      <div class="flex-1 flex items-center gap-8">
        <a routerLink="/" class="flex items-center gap-2 font-display font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
              <path d="M2 7h20"></path>
              <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path>
            </svg>
          </div>
          <span class="text-text-primary">TRATO</span>
        </a>

        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <a routerLink="/products" routerLinkActive="text-primary font-semibold" class="text-text-secondary hover:text-text-primary transition-colors">Productos</a>
          <a routerLink="/auctions" routerLinkActive="text-primary font-semibold" class="text-text-secondary hover:text-text-primary transition-colors">Subastas</a>
          <a routerLink="/payments" routerLinkActive="text-primary font-semibold" class="text-text-secondary hover:text-text-primary transition-colors">Pagos</a>
          <a routerLink="/reports" routerLinkActive="text-primary font-semibold" class="text-text-secondary hover:text-text-primary transition-colors">Reportes</a>
          <a routerLink="/asesor" routerLinkActive="text-primary font-semibold" class="text-text-secondary hover:text-text-primary transition-colors">Asesor</a>
        </nav>
      </div>

      @if (authService.isLoggedIn()) {
        <div class="flex items-center gap-4">
          <a routerLink="/products/create" class="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-glow hidden md:block">Crear Producto</a>
          <app-notification-bell />
          <span class="text-sm text-text-secondary hidden md:block">{{ authService.currentUser()?.email }}</span>
          <button (click)="logout()" class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Cerrar sesión</button>
        </div>
      } @else {
        <div class="flex items-center gap-4">
          <a routerLink="/login" class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Iniciar Sesión</a>
          <a routerLink="/register" class="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-glow">Comenzar</a>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
