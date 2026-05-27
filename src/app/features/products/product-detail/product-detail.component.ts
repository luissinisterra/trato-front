import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService, CreateAuctionRequest } from '../../auctions/services/auction.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    @if (isLoading()) {
      <div class="animate-pulse space-y-8 max-w-5xl mx-auto">
        <div class="h-8 bg-bg-hover w-1/4 rounded-md"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="aspect-square bg-bg-hover rounded-2xl"></div>
          <div class="space-y-6">
            <div class="h-10 bg-bg-hover w-3/4 rounded-md"></div>
            <div class="h-6 bg-bg-hover w-1/3 rounded-md"></div>
            <div class="space-y-2">
              <div class="h-4 bg-bg-hover w-full rounded-md"></div>
              <div class="h-4 bg-bg-hover w-full rounded-md"></div>
              <div class="h-4 bg-bg-hover w-2/3 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    } @else if (product(); as p) {
      <div class="max-w-5xl mx-auto">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a routerLink="/products" class="hover:text-text-primary transition-colors">Productos</a>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span class="text-text-primary truncate max-w-[200px]">{{ p.name }}</span>
        </nav>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <div class="aspect-square glass-elevated rounded-3xl overflow-hidden border border-border/50 flex items-center justify-center bg-bg-hover">
              @if (p.images && p.images.length > 0) {
                <img [src]="p.images[0].url" [alt]="p.name" class="w-full h-full object-cover">
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              }
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex flex-col">
            <div class="mb-6">
              @if (p.status === 'ACTIVE') {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 mb-4">
                  <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Disponible para Subasta
                </span>
              }
              <h1 class="text-4xl font-display font-bold text-text-primary mb-2">{{ p.name }}</h1>
              <p class="text-3xl text-accent font-bold">{{ p.base_price | currency }} <span class="text-sm font-normal text-text-muted">Precio Base</span></p>
            </div>

            @if (p.description) {
              <div class="glass rounded-2xl p-6 mb-8 text-text-secondary leading-relaxed">
                {{ p.description }}
              </div>
            } @else {
              <div class="glass rounded-2xl p-6 mb-8 text-text-muted italic text-center">
                Sin descripción
              </div>
            }

            <div class="mt-auto space-y-4">
              @if (isOwner()) {
                <div class="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <h4 class="font-bold text-primary mb-1">Este producto es tuyo</h4>
                  <p class="text-sm text-text-secondary mb-4">Puedes crear una subasta para este producto y empezar a recibir ofertas.</p>
                  <button (click)="openCreateAuctionModal()" class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    Crear Subasta
                  </button>
                  <button (click)="openDeleteConfirm()"
                          class="w-full mt-3 py-3 rounded-xl font-medium transition-colors border-2 border-danger/30 text-danger hover:bg-danger/10 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Eliminar Producto
                  </button>
                </div>
              } @else {
                <button disabled class="w-full bg-bg-elevated text-text-muted font-bold py-3 px-4 rounded-xl border border-border cursor-not-allowed">
                  Solo el propietario puede crear una subasta
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      @if (isDeleteConfirmOpen()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeDeleteConfirm()"></div>
          <div class="relative glass-elevated w-full max-w-sm p-8 rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <h2 class="text-xl font-bold mb-2">Eliminar Producto</h2>
            <p class="text-text-muted text-sm mb-6">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
            <div class="flex gap-3">
              <button (click)="closeDeleteConfirm()"
                      class="flex-1 bg-bg-hover hover:bg-bg-elevated text-text-primary font-medium py-3 rounded-xl transition-colors border border-border">
                Cancelar
              </button>
              <button (click)="confirmDeleteProduct()" [disabled]="isDeleting()"
                      class="flex-1 bg-danger hover:bg-danger/80 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                @if (isDeleting()) {
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                } @else {
                  Eliminar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Auction Modal -->
      @if (isCreateAuctionOpen()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeCreateAuctionModal()"></div>

          <div class="relative glass-elevated w-full max-w-md p-8 rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <button (click)="closeCreateAuctionModal()" class="absolute top-4 right-4 text-text-muted hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 class="text-2xl font-bold mb-2 text-center">Crear Subasta</h2>
            <p class="text-text-muted text-sm text-center mb-6">Configura los parámetros de la subasta para este producto.</p>

            <form [formGroup]="auctionForm" (ngSubmit)="submitAuction()">
              <div class="space-y-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Precio de Salida</label>
                  <input type="number" formControlName="startPrice"
                         class="w-full bg-transparent border-2 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-primary transition-colors text-text-primary"
                         [class.border-danger]="auctionForm.get('startPrice')?.touched && auctionForm.get('startPrice')?.invalid"
                         [class.border-border]="!(auctionForm.get('startPrice')?.touched && auctionForm.get('startPrice')?.invalid)">
                  @if (auctionForm.get('startPrice')?.touched && auctionForm.get('startPrice')?.hasError('min')) {
                    <p class="text-xs text-danger mt-1">Debe ser mayor a 0</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-text-secondary mb-1">Incremento Mínimo</label>
                  <input type="number" formControlName="minIncrement"
                         class="w-full bg-transparent border-2 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-primary transition-colors text-text-primary"
                         [class.border-danger]="auctionForm.get('minIncrement')?.touched && auctionForm.get('minIncrement')?.invalid"
                         [class.border-border]="!(auctionForm.get('minIncrement')?.touched && auctionForm.get('minIncrement')?.invalid)">
                  @if (auctionForm.get('minIncrement')?.touched && auctionForm.get('minIncrement')?.hasError('min')) {
                    <p class="text-xs text-danger mt-1">Debe ser mayor a 0</p>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Fecha de Inicio</label>
                    <input type="datetime-local" formControlName="startTime"
                           class="w-full bg-transparent border-2 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
                           [class.border-danger]="auctionForm.get('startTime')?.touched && auctionForm.get('startTime')?.invalid"
                           [class.border-border]="!(auctionForm.get('startTime')?.touched && auctionForm.get('startTime')?.invalid)">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-1">Fecha de Fin</label>
                    <input type="datetime-local" formControlName="endTime"
                           class="w-full bg-transparent border-2 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
                           [class.border-danger]="auctionForm.get('endTime')?.touched && auctionForm.get('endTime')?.invalid"
                           [class.border-border]="!(auctionForm.get('endTime')?.touched && auctionForm.get('endTime')?.invalid)">
                  </div>
                </div>
              </div>

              <button type="submit" [disabled]="auctionForm.invalid || isSubmitting()"
                      class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-glow disabled:opacity-50 flex justify-center items-center gap-2">
                @if (isSubmitting()) {
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                } @else {
                  Crear Subasta
                }
              </button>
            </form>
          </div>
        </div>
      }
    } @else {
      <div class="text-center py-24 glass rounded-3xl">
        <h2 class="text-2xl font-bold text-text-primary">Producto no encontrado</h2>
        <a routerLink="/products" class="inline-block mt-4 text-primary hover:underline">Volver a productos</a>
      </div>
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private auctionService = inject(AuctionService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  product = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  isOwner = signal<boolean>(false);
  isCreateAuctionOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isDeleteConfirmOpen = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  auctionForm = this.fb.group({
    startPrice: [0, [Validators.required, Validators.min(0.01)]],
    minIncrement: [0, [Validators.required, Validators.min(0.01)]],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(parseInt(id, 10));
    }
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.product.set(res.data);

          // Check if current user is owner
          const currentUser = this.authService.currentUser();
          if (currentUser && currentUser.id === res.data.owner_id) {
            this.isOwner.set(true);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openDeleteConfirm() {
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen.set(false);
  }

  confirmDeleteProduct() {
    const p = this.product();
    if (!p || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.productService.deleteProduct(p.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteConfirmOpen.set(false);
        this.toastService.success('Producto eliminado correctamente');
        this.router.navigate(['/products']);
      },
      error: () => {
        this.isDeleting.set(false);
        this.toastService.error('Error al eliminar el producto');
      }
    });
  }

  openCreateAuctionModal() {
    const p = this.product();
    if (!p) return;

    const now = new Date(Date.now() + 5 * 60 * 1000);
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.auctionForm.patchValue({
      startPrice: p.base_price,
      minIncrement: p.base_price * 0.05,
      startTime: this.toDatetimeLocal(now),
      endTime: this.toDatetimeLocal(end)
    });

    this.isCreateAuctionOpen.set(true);
  }

  closeCreateAuctionModal() {
    this.isCreateAuctionOpen.set(false);
  }

  submitAuction() {
    if (this.auctionForm.invalid || this.isSubmitting()) return;

    const p = this.product();
    const currentUser = this.authService.currentUser();
    if (!p || !currentUser) return;

    const formVal = this.auctionForm.value;
    const startTime = new Date(formVal.startTime!).toISOString();
    const endTime = new Date(formVal.endTime!).toISOString();

    const data: CreateAuctionRequest = {
      productId: p.id,
      sellerId: currentUser.id,
      startPrice: formVal.startPrice!,
      minIncrement: formVal.minIncrement!,
      startTime,
      endTime
    };

    this.isSubmitting.set(true);
    this.auctionService.createAuction(data).subscribe({
      next: (auction) => {
        this.isSubmitting.set(false);
        this.closeCreateAuctionModal();
        this.toastService.success('¡Subasta creada con éxito!');
        this.router.navigate(['/auctions', auction.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Error al crear la subasta. Intenta de nuevo.';
        this.toastService.error(msg);
      }
    });
  }

  private toDatetimeLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  }
}
