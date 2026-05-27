import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="glass-elevated max-w-lg w-full space-y-8 p-8 rounded-2xl relative overflow-hidden">

        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 blur-3xl rounded-full"></div>

        <div class="relative">
          <h2 class="text-center text-3xl font-display font-bold tracking-tight text-text-primary">
            Crear Producto
          </h2>
          <p class="mt-2 text-center text-sm text-text-muted">
            Publica un nuevo producto para subastar
          </p>
        </div>

        <form class="mt-8 space-y-6 relative" [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-text-primary mb-1">Nombre</label>
              <input id="name" type="text" required
                     formControlName="name"
                     class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                     placeholder="Nombre del producto">
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-text-primary mb-1">Descripción</label>
              <textarea id="description" rows="4"
                        formControlName="description"
                        class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors resize-none"
                        placeholder="Describe tu producto..."></textarea>
            </div>

            <div>
              <label for="base_price" class="block text-sm font-medium text-text-primary mb-1">Precio base</label>
              <input id="base_price" type="number" step="0.01" min="0.01" required
                     formControlName="base_price"
                     class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                     placeholder="0.00">
            </div>

            <div>
              <label for="image_urls" class="block text-sm font-medium text-text-primary mb-1">URLs de imágenes</label>
              <input id="image_urls" type="text"
                     formControlName="image_urls"
                     class="appearance-none rounded-lg relative block w-full px-4 py-3 bg-bg-hover border border-border placeholder-text-muted text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                     placeholder="https://ejemplo.com/imagen.jpg (opcional, separa con comas)">
            </div>
          </div>

          <div class="flex items-center gap-4">
            <a routerLink="/products"
               class="flex-1 flex justify-center py-3 px-4 border border-border text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all">
              Cancelar
            </a>
            <button type="submit" [disabled]="productForm.invalid || isLoading()"
                    class="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow">

              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                Crear Producto
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal(false);

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    base_price: [0, [Validators.required, Validators.min(0.01)]],
    image_urls: ['']
  });

  onSubmit() {
    if (this.productForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.toastService.error('Debes iniciar sesión para crear productos');
        this.isLoading.set(false);
        return;
      }

      const val = this.productForm.value;
      const imageUrls = val.image_urls
        ? val.image_urls.split(',').map(u => u.trim()).filter(u => u.length > 0)
        : undefined;

      this.productService.createProduct({
        name: val.name!,
        description: val.description || undefined,
        base_price: val.base_price!,
        owner_id: currentUser.id,
        image_urls: imageUrls
      }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.success('Producto creado con éxito');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Error al crear el producto';
          this.toastService.error(msg, 'Error');
        }
      });
    }
  }
}
