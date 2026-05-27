import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-display font-bold">Notificaciones</h1>
        <a routerLink="/" class="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Volver al inicio
        </a>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="space-y-4">
          @for (_ of [1,2,3,4,5]; track _) {
            <div class="glass rounded-2xl p-5 border border-border animate-pulse">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-bg-hover shrink-0"></div>
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-bg-hover rounded w-3/4"></div>
                  <div class="h-3 bg-bg-hover rounded w-full"></div>
                  <div class="h-3 bg-bg-hover rounded w-1/4"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="glass rounded-3xl p-12 text-center border border-border">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 class="text-xl font-bold mb-2">No pudimos cargar tus notificaciones</h2>
          <p class="text-text-muted text-sm mb-6">Revisa tu conexión e intenta de nuevo</p>
          <button (click)="loadNotifications()" class="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-xl transition-all shadow-glow">
            Intentar de nuevo
          </button>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && !error() && notifications().length === 0) {
        <div class="glass rounded-3xl p-16 text-center border border-border">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-hover flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          </div>
          <h2 class="text-xl font-bold mb-2">No tienes notificaciones aún</h2>
          <p class="text-text-muted text-sm">Cuando recibas actualizaciones de tus subastas, aparecerán aquí</p>
        </div>
      }

      <!-- Notifications List -->
      @if (!isLoading() && !error()) {
        <div class="space-y-3">
          @for (notif of notifications(); track notif._id) {
            <div class="glass rounded-2xl p-5 border transition-all duration-200 cursor-pointer hover:border-primary/30"
                 [class.border-border]="notif.read"
                 [class.border-primary/20]="!notif.read"
                 (click)="handleClick(notif)">
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg"
                     [ngClass]="getIconBg(notif.type)">
                  {{ getIcon(notif.type) }}
                </div>
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="font-semibold text-sm"
                        [class.text-text-primary]="!notif.read"
                        [class.text-text-secondary]="notif.read">
                      {{ notif.title }}
                    </h3>
                    @if (!notif.read) {
                      <span class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                    }
                  </div>
                  <p class="text-sm text-text-muted mt-1 line-clamp-2">{{ notif.message }}</p>
                  <p class="text-xs text-text-muted/60 mt-2">{{ timeAgo(notif.created_at) }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Load More -->
      @if (hasMore()) {
        <div class="text-center mt-8">
          <button (click)="loadMore()" [disabled]="isLoadingMore()"
                  class="bg-bg-hover hover:bg-bg-elevated text-text-primary font-medium px-8 py-3 rounded-xl transition-colors border border-border disabled:opacity-50">
            @if (isLoadingMore()) {
              <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              Cargar más
            }
          </button>
        </div>
      }
    </div>
  `
})
export class NotificationsPageComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);

  notifications = signal<Notification[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal(false);

  currentPage = 1;
  totalPages = 1;

  hasMore = computed(() => this.currentPage < this.totalPages);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.error.set(false);
    this.currentPage = 1;

    this.notificationService.getNotifications(1).subscribe({
      next: (res) => {
        this.notifications.set(res.data);
        this.totalPages = res.pagination.totalPages;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set(true);
      }
    });
  }

  loadMore() {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);
    this.currentPage++;

    this.notificationService.getNotifications(this.currentPage).subscribe({
      next: (res) => {
        this.notifications.update(prev => [...prev, ...res.data]);
        this.totalPages = res.pagination.totalPages;
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.currentPage--;
        this.isLoadingMore.set(false);
        this.toastService.error('Error al cargar más notificaciones');
      }
    });
  }

  handleClick(notif: Notification) {
    if (!notif.read) {
      this.notificationService.markAsRead(notif._id).subscribe({
        next: () => {
          this.notifications.update(prev =>
            prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
          );
        },
        error: () => {}
      });
    }
  }

  timeAgo(dateStr: string): string {
    const now = new Date().getTime();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'OUTBID': return '🔥';
      case 'WINNING': return '⚡';
      case 'AUCTION_WON': return '🏆';
      case 'AUCTION_LOST': return '💔';
      case 'AUCTION_ENDING': return '⏰';
      case 'LOGIN_ALERT': return '🔐';
      case 'AUCTION_CREATED': return '🎉';
      case 'BID_ACCEPTED': return '✅';
      case 'BID_REJECTED': return '❌';
      case 'BID_CREATED': return '💰';
      case 'AUCTION_STARTED': return '🚀';
      case 'AUCTION_CLOSED': return '🔒';
      default: return '🔔';
    }
  }

  getIconBg(type: string): string {
    switch (type) {
      case 'OUTBID': return 'bg-orange-500/10 text-orange-400';
      case 'WINNING': return 'bg-emerald-500/10 text-emerald-400';
      case 'AUCTION_WON': return 'bg-yellow-500/10 text-yellow-400';
      case 'AUCTION_LOST': return 'bg-red-500/10 text-red-400';
      case 'AUCTION_ENDING': return 'bg-blue-500/10 text-blue-400';
      case 'LOGIN_ALERT': return 'bg-purple-500/10 text-purple-400';
      case 'AUCTION_CREATED': return 'bg-green-500/10 text-green-400';
      case 'BID_ACCEPTED': return 'bg-teal-500/10 text-teal-400';
      case 'BID_REJECTED': return 'bg-rose-500/10 text-rose-400';
      case 'BID_CREATED': return 'bg-cyan-500/10 text-cyan-400';
      case 'AUCTION_STARTED': return 'bg-indigo-500/10 text-indigo-400';
      case 'AUCTION_CLOSED': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-bg-hover text-text-secondary';
    }
  }
}
