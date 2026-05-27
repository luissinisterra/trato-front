import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-display font-bold tracking-tight text-text-primary">Explorar Productos</h1>
        <p class="mt-2 text-text-muted">Descubre artículos únicos listos para subasta.</p>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="glass-elevated rounded-2xl p-4 space-y-4 animate-pulse">
              <div class="w-full h-48 bg-bg-hover rounded-xl"></div>
              <div class="space-y-2">
                <div class="h-5 bg-bg-hover rounded-md w-3/4"></div>
                <div class="h-4 bg-bg-hover rounded-md w-1/2"></div>
              </div>
              <div class="flex justify-between items-center pt-2">
                <div class="h-6 bg-bg-hover rounded-md w-1/3"></div>
                <div class="h-8 bg-bg-hover rounded-lg w-20"></div>
              </div>
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-24 glass-elevated rounded-3xl border border-border/50 max-w-2xl mx-auto">
          <div class="w-20 h-20 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">No se encontraron productos</h3>
          <p class="text-text-muted max-w-sm mx-auto">No hay productos disponibles en este momento. Vuelve más tarde.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (product of products(); track product.id) {
            <a [routerLink]="['/products', product.id]" class="group glass-elevated rounded-2xl p-4 flex flex-col hover:border-primary/50 transition-all hover:shadow-glow hover:-translate-y-1">
              <div class="w-full h-48 rounded-xl bg-bg-hover relative overflow-hidden mb-4 border border-border/50">
                @if (product.images && product.images.length > 0) {
                  <img [src]="product.images[0].url" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                }
                
                @if (product.status === 'ACTIVE') {
                  <div class="absolute top-2 right-2 bg-success/20 text-success text-xs font-bold px-2 py-1 rounded-full border border-success/30 backdrop-blur-md">
                    Disponible
                  </div>
                }
              </div>
              
              <div class="flex-1 flex flex-col">
                <h3 class="text-lg font-bold text-text-primary truncate group-hover:text-primary transition-colors">{{ product.name }}</h3>
                <p class="text-sm text-text-muted line-clamp-2 mt-1 flex-1">{{ product.description }}</p>
                
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div>
                    <p class="text-xs text-text-muted">Precio Base</p>
                    <p class="font-bold text-accent">{{ product.base_price | currency }}</p>
                  </div>
                  <div class="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Ver
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
