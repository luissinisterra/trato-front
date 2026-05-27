import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService, CreatePaymentPayload } from '../services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Payment, PaymentMethod } from '../models/payment.model';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-display font-bold">Pagos</h1>
          <p class="text-text-secondary mt-2">Gestiona pagos y revisa los detalles de tus subastas.</p>
        </div>
        <a routerLink="/" class="text-sm text-text-secondary hover:text-text-primary transition-colors">Volver al inicio</a>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-10">
        <section class="glass rounded-3xl p-6 border border-border">
          <h2 class="text-xl font-semibold mb-4">Crear pago</h2>
          <form [formGroup]="paymentForm" (ngSubmit)="submitPayment()" class="space-y-4">
            <label class="block text-sm font-medium text-text-secondary">ID de subasta</label>
            <input formControlName="auctionId" type="number" min="1" placeholder="Ej. 123" class="w-full rounded-2xl border border-border px-4 py-3 bg-transparent text-text-primary focus:border-primary outline-none transition-colors" />

            <label class="block text-sm font-medium text-text-secondary">Monto</label>
            <input formControlName="amount" type="number" min="0.01" step="0.01" placeholder="Ej. 500.00" class="w-full rounded-2xl border border-border px-4 py-3 bg-transparent text-text-primary focus:border-primary outline-none transition-colors" />

            <label class="block text-sm font-medium text-text-secondary">Método de pago</label>
            <select formControlName="paymentMethod" class="w-full rounded-2xl border border-border px-4 py-3 bg-transparent text-text-primary focus:border-primary outline-none transition-colors">
              @for (option of paymentMethods; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>

            <button type="submit" [disabled]="isSubmitting()" class="w-full rounded-2xl bg-primary text-white py-3 font-semibold transition-all hover:bg-primary-hover disabled:opacity-50">
              @if (isSubmitting()) { Creando pago... } @else { Crear pago }
            </button>
          </form>

          @if (createdPayment()) {
            <div class="mt-8 rounded-3xl bg-bg-hover border border-border p-5">
              <h3 class="font-semibold text-lg mb-3">Pago creado</h3>
              <p class="text-sm text-text-secondary mb-2">ID: {{ createdPayment()!.id }}</p>
              <p class="text-sm text-text-secondary mb-2">Estado: <span class="font-semibold">{{ createdPayment()!.status }}</span></p>
              <p class="text-sm text-text-secondary">Monto: {{ createdPayment()!.amount | currency }}</p>
            </div>
          }
        </section>

        <section class="glass rounded-3xl p-6 border border-border">
          <h2 class="text-xl font-semibold mb-4">Buscar pagos por subasta</h2>
          <form [formGroup]="searchForm" (ngSubmit)="searchPayments()" class="space-y-4">
            <label class="block text-sm font-medium text-text-secondary">ID de subasta</label>
            <input formControlName="auctionId" type="number" min="1" placeholder="Ej. 123" class="w-full rounded-2xl border border-border px-4 py-3 bg-transparent text-text-primary focus:border-primary outline-none transition-colors" />
            <button type="submit" [disabled]="isLoading()" class="w-full rounded-2xl bg-bg-hover text-text-primary border border-border py-3 font-semibold transition-all hover:bg-bg-elevated disabled:opacity-50">
              @if (isLoading()) { Cargando... } @else { Buscar pagos }
            </button>
          </form>

          @if (errorMessage()) {
            <p class="text-sm text-danger mt-4">{{ errorMessage() }}</p>
          }

          @if (!isLoading() && payments().length > 0) {
            <div class="mt-6 space-y-3">
              @for (payment of payments(); track payment.id) {
                <div class="rounded-3xl bg-bg-elevated border border-border p-4">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-semibold">Pago #{{ payment.id }}</p>
                      <p class="text-xs text-text-muted">Usuario #{{ payment.user_id }} · {{ payment.payment_method }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold">{{ payment.amount | currency }}</p>
                      <p class="text-xs text-text-muted">{{ payment.status }}</p>
                    </div>
                  </div>
                  <p class="text-xs text-text-muted mt-3">Creado: {{ payment.created_at | date:'medium' }}</p>
                </div>
              }
            </div>
          } @else if (!isLoading() && payments().length === 0 && searchForm.get('auctionId')?.value) {
            <p class="text-sm text-text-muted mt-6">No se encontraron pagos para esta subasta.</p>
          }
        </section>
      </div>
    </div>
  `
})
export class PaymentPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  paymentMethods = [
    { value: 'credit_card' as PaymentMethod, label: 'Tarjeta de crédito' },
    { value: 'debit_card' as PaymentMethod, label: 'Tarjeta de débito' },
    { value: 'bank_transfer' as PaymentMethod, label: 'Transferencia bancaria' },
    { value: 'paypal' as PaymentMethod, label: 'PayPal' }
  ];

  paymentForm = this.fb.group({
    auctionId: [null, Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethod: ['credit_card', Validators.required]
  });

  searchForm = this.fb.group({
    auctionId: [null, Validators.required]
  });

  payments = signal<Payment[]>([]);
  createdPayment = signal<Payment | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');

  ngOnInit() {}

  submitPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();

    if (!user) {
      this.toastService.error('Debes iniciar sesión para crear un pago');
      return;
    }

    const formValue = this.paymentForm.value as { auctionId: number | null; amount: number | null; paymentMethod: PaymentMethod | null };
    if (formValue.auctionId == null || formValue.amount == null || !formValue.paymentMethod) {
      this.toastService.error('Completa todos los campos del pago');
      this.isSubmitting.set(false);
      return;
    }

    this.isSubmitting.set(true);
    this.paymentService.createPayment({
      auction_id: Number(formValue.auctionId),
      amount: Number(formValue.amount),
      payment_method: formValue.paymentMethod,
      user_id: user.id
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.createdPayment.set(response.data);
          this.toastService.success('Pago creado correctamente');
          this.paymentForm.patchValue({ amount: null });
        } else {
          this.toastService.error(response.message || 'No se pudo crear el pago');
        }
      },
      error: () => {
        this.toastService.error('Error al crear el pago');
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  searchPayments() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const auctionId = Number(this.searchForm.value.auctionId);
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.payments.set([]);

    this.paymentService.getPaymentsByAuction(auctionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payments.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'No se pudieron cargar los pagos');
        }
      },
      error: () => {
        this.errorMessage.set('Error al buscar pagos');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
