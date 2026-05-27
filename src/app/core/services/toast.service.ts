import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', title?: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type, title };
    
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(message: string, title?: string) {
    this.show(message, 'success', title);
  }

  error(message: string, title?: string) {
    this.show(message, 'error', title);
  }

  warning(message: string, title?: string) {
    this.show(message, 'warning', title);
  }

  info(message: string, title?: string) {
    this.show(message, 'info', title);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
