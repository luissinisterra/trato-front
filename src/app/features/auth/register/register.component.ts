import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="glass-elevated max-w-md w-full space-y-8 p-8 rounded-2xl relative overflow-hidden">
        
        <!-- Decoration -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full"></div>

        <div class="relative">
          <h2 class="text-center text-3xl font-display font-bold tracking-tight text-text-primary">
            Únete a TRATO
          </h2>
          <p class="mt-2 text-center text-sm text-text-muted">
            ¿Ya tienes una cuenta?
            <a routerLink="/login" class="font-medium text-primary hover:text-primary-hover transition-colors">
              Inicia sesión
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6 relative" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="email" class="sr-only">Correo electrónico</label>
              <input id="email" type="email" autocomplete="email" required
                     formControlName="email"
                     class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                     placeholder="correo@ejemplo.com">
              
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <p class="mt-1 text-xs text-danger">Ingresa un correo electrónico válido</p>
              }
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <input id="password" type="password" autocomplete="new-password" required
                     formControlName="password"
                     class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                     placeholder="Contraseña (mín. 8 caracteres)">
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
                <p class="mt-1 text-xs text-danger">La contraseña debe tener al menos 8 caracteres</p>
              }
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="registerForm.invalid || isLoading()"
                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow">
              
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              } @else {
                Crear Cuenta
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      const val = this.registerForm.value;
      
      this.authService.register({ email: val.email!, password: val.password! }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toastService.success('¡Cuenta creada con éxito!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Registro fallido. Intenta de nuevo.';
          this.toastService.error(msg, 'Error de registro');
        }
      });
    }
  }
}
