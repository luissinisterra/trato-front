import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/notifications" class="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-bg-hover transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-secondary">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
      </svg>
      @if (unreadCount() > 0) {
        <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center shadow-glow">
          {{ unreadCount() > 99 ? '99+' : unreadCount() }}
        </span>
      }
    </a>
  `
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  unreadCount = signal(0);
  private refreshSub?: Subscription;

  ngOnInit() {
    this.loadCount();
    this.refreshSub = interval(30000).subscribe(() => this.loadCount());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  loadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {}
    });
  }
}
