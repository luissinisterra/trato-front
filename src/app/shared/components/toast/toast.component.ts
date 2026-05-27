import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto rounded-lg p-4 shadow-glow flex items-start gap-3 backdrop-blur-md border animate-in slide-in-from-bottom-2 fade-in"
             [class]="getToastClasses(toast.type)">
          <div class="flex-1">
            @if (toast.title) {
              <h4 class="text-sm font-semibold mb-1">{{ toast.title }}</h4>
            }
            <p class="text-sm">{{ toast.message }}</p>
          </div>
          <button class="shrink-0 opacity-70 hover:opacity-100 transition-opacity" (click)="toastService.remove(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getToastClasses(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'error':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'info':
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  }
}
