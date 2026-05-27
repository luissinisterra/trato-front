import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportService } from '../services/report.service';
import { Report, ReportRequest, ReportType } from '../models/report.model';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-display font-bold">Reportes</h1>
          <p class="text-text-secondary mt-2">Solicita reportes y revisa el historial de tus datos.</p>
        </div>
        <a routerLink="/" class="text-sm text-text-secondary hover:text-text-primary transition-colors">Volver al inicio</a>
      </div>

      <div class="glass rounded-3xl p-6 border border-border mb-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold">Solicitar nuevo reporte</h2>
            <p class="text-text-secondary text-sm">Máximo 10 reportes por 24 horas.</p>
          </div>
          <div class="text-sm text-text-secondary">Pendientes: <span class="font-semibold">{{ pendingRequests().length }}</span></div>
        </div>

        <form [formGroup]="reportForm" (ngSubmit)="generateReport()" class="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <label class="block text-sm font-medium text-text-secondary">Tipo de reporte</label>
            <select formControlName="type" class="w-full rounded-2xl border border-border px-4 py-3 bg-transparent text-text-primary focus:border-primary outline-none transition-colors">
              @for (option of reportTypes; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>

          <button type="submit" [disabled]="isSubmitting()" class="w-full rounded-2xl bg-primary text-white py-3 font-semibold transition-all hover:bg-primary-hover disabled:opacity-50">
            @if (isSubmitting()) { Generando... } @else { Generar reporte }
          </button>
        </form>
      </div>

      <section class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div class="glass rounded-3xl p-6 border border-border">
          <h2 class="text-xl font-semibold mb-4">Tus reportes</h2>

          @if (isLoading()) {
            <p class="text-text-muted">Cargando reportes...</p>
          } @else if (errorMessage()) {
            <p class="text-danger">{{ errorMessage() }}</p>
          } @else if (reports().length === 0) {
            <p class="text-text-muted">Aún no tienes reportes generados.</p>
          } @else {
            <div class="space-y-4">
              @for (report of reports(); track report.id) {
                <div class="rounded-3xl bg-bg-elevated border border-border p-4">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p class="font-semibold">Reporte #{{ report.id }}</p>
                      <p class="text-xs text-text-muted">Tipo: {{ reportTypeLabel(report.type) }} · Estado: {{ report.status || 'completed' }}</p>
                      <p class="text-xs text-text-muted">Generado: {{ formatDate(report.created_at) }}</p>
                    </div>
                    <button type="button" (click)="deleteReport(report.id)" class="rounded-2xl border border-danger text-danger px-4 py-2 text-sm transition-colors hover:bg-danger/10">Eliminar</button>
                  </div>
                  @if (report.data['error']) {
                    <div class="mt-4 rounded-2xl border border-warning bg-warning/10 p-4 text-sm text-warning">
                      <p class="font-semibold">Error generando reporte</p>
                      <p>{{ report.data['error'] }}</p>
                      <p *ngIf="report.data['details']">{{ report.data['details'] }}</p>
                    </div>
                  } @else {
                    <div class="mt-4 grid gap-3 sm:grid-cols-2">
                      @for (field of reportFields(report); track field.label) {
                        <div class="rounded-2xl bg-bg-hover p-4">
                          <p class="text-xs text-text-secondary">{{ field.label }}</p>
                          <p class="font-semibold">{{ field.value }}</p>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <div class="glass rounded-3xl p-6 border border-border">
          <h2 class="text-xl font-semibold mb-4">Notas rápidas</h2>
          <ul class="space-y-3 text-sm text-text-secondary">
            <li>• Los reportes pueden tardar unos segundos en generarse.</li>
            <li>• El reporte <strong>auction_history</strong> muestra tu actividad de subastas.</li>
            <li>• El reporte <strong>bid_history</strong> muestra pujas realizadas.</li>
            <li>• El reporte <strong>earnings</strong> muestra ganancias estimadas.</li>
            <li>• El reporte <strong>sales_summary</strong> muestra resumen de ventas.</li>
          </ul>
        </div>
      </section>
    </div>
  `
})
export class ReportPageComponent implements OnInit {
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  reportTypes = [
    { value: 'auction_history' as ReportType, label: 'Historial de subastas' },
    { value: 'bid_history' as ReportType, label: 'Historial de pujas' },
    { value: 'earnings' as ReportType, label: 'Ingresos' },
    { value: 'sales_summary' as ReportType, label: 'Resumen de ventas' }
  ];

  reportForm = this.fb.group({
    type: ['auction_history', Validators.required]
  });

  reports = signal<Report[]>([]);
  pendingRequests = signal<ReportRequest[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.loadReports();
  }

  private userId() {
    return this.authService.currentUser()?.id ?? null;
  }

  private loadReports() {
    const userId = this.userId();
    if (!userId) {
      this.errorMessage.set('Necesitas iniciar sesión para ver tus reportes');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reportService.getUserReports(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reports.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'No se pudieron cargar los reportes');
        }
      },
      error: () => {
        this.errorMessage.set('Error al cargar los reportes');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });

    this.reportService.getPendingRequests(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pendingRequests.set(response.data);
        } else {
          this.pendingRequests.set([]);
        }
      },
      error: () => {
        this.pendingRequests.set([]);
      }
    });
  }

  generateReport() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const userId = this.userId();
    if (!userId) {
      this.toastService.error('Debes iniciar sesión para generar un reporte');
      return;
    }

    const type = this.reportForm.value.type as ReportType;
    this.isSubmitting.set(true);

    this.reportService.generateReport(type).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.toastService.success('Reporte generado correctamente');
          this.reports.update(current => response.data ? [response.data, ...current] : current);
          this.loadReports();
        } else {
          this.toastService.error(response.message || 'No se pudo generar el reporte');
        }
      },
      error: () => {
        this.toastService.error('Error al generar el reporte');
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  deleteReport(reportId: number) {
    this.reportService.deleteReport(reportId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Reporte eliminado');
          this.reports.update(current => current.filter(report => report.id !== reportId));
        } else {
          this.toastService.error(response.message || 'No se pudo eliminar el reporte');
        }
      },
      error: () => {
        this.toastService.error('Error al eliminar el reporte');
      }
    });
  }

  reportTypeLabel(type: ReportType): string {
    switch (type) {
      case 'auction_history':
        return 'Historial de subastas';
      case 'bid_history':
        return 'Historial de pujas';
      case 'earnings':
        return 'Ingresos';
      case 'sales_summary':
        return 'Resumen de ventas';
      default:
        return type;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatCurrency(value: unknown): string {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  reportFields(report: Report) {
    if (!report.data || report.data['error']) {
      return [];
    }

    const getNumber = (key: string) => report.data[key] != null ? report.data[key] : 'N/A';

    if (report.type === 'auction_history') {
      return [
        { label: 'Período', value: report.data['period'] ?? 'N/A' },
        { label: 'Subastas totales', value: getNumber('total_auctions') },
        { label: 'Finalizadas', value: getNumber('completed') },
        { label: 'Canceladas', value: getNumber('cancelled') },
        { label: 'Activas', value: getNumber('active') },
        { label: 'Precio promedio', value: report.data['average_price'] != null ? this.formatCurrency(report.data['average_price']) : 'N/A' },
        { label: 'Moneda', value: report.data['currency'] ?? 'N/A' }
      ];
    }

    if (report.type === 'bid_history') {
      return [
        { label: 'Período', value: report.data['period'] ?? 'N/A' },
        { label: 'Pujas totales', value: getNumber('total_bids') },
        { label: 'Pujas exitosas', value: getNumber('successful_bids') },
        { label: 'Pujas fallidas', value: getNumber('failed_bids') },
        { label: 'Pujas pendientes', value: getNumber('pending_bids') },
        { label: 'Promedio por puja', value: report.data['average_bid_amount'] != null ? this.formatCurrency(report.data['average_bid_amount']) : 'N/A' },
        { label: 'Moneda', value: report.data['currency'] ?? 'N/A' }
      ];
    }

    if (report.type === 'earnings') {
      return [
        { label: 'Período', value: report.data['period'] ?? 'N/A' },
        { label: 'Ganancias totales', value: report.data['total_earnings'] != null ? this.formatCurrency(report.data['total_earnings']) : 'N/A' },
        { label: 'Transacciones completadas', value: getNumber('total_transactions') },
        { label: 'Transacciones pendientes', value: getNumber('pending_transactions') },
        { label: 'Promedio por transacción', value: report.data['average_transaction'] != null ? this.formatCurrency(report.data['average_transaction']) : 'N/A' },
        { label: 'Moneda', value: report.data['currency'] ?? 'N/A' }
      ];
    }

    if (report.type === 'sales_summary') {
      return [
        { label: 'Ventas totales', value: getNumber('total_sales') },
        { label: 'Monto total', value: report.data['total_amount'] != null ? this.formatCurrency(report.data['total_amount']) : 'N/A' },
        { label: 'Valor promedio', value: report.data['average_sale_value'] != null ? this.formatCurrency(report.data['average_sale_value']) : 'N/A' },
        { label: 'Subastas completadas', value: getNumber('completed_auctions') },
        { label: 'Top subastas', value: Array.isArray(report.data['top_auction_ids']) ? (report.data['top_auction_ids'] as string[]).join(', ') : 'N/A' },
        { label: 'Moneda', value: report.data['currency'] ?? 'N/A' }
      ];
    }

    return Object.keys(report.data).map(key => ({
      label: key,
      value: String(report.data[key])
    }));
  }
}
