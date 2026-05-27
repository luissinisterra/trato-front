import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuctionService } from '../services/auction.service';
import { BidService } from '../services/bid.service';
import { PaymentService } from '../../payments/services/payment.service';
import { ProductService } from '../../products/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Auction, Bid } from '../models/auction.model';
import { Product } from '../../products/models/product.model';
import { forkJoin, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    @if (isLoading()) {
      <div class="animate-pulse space-y-8 max-w-6xl mx-auto">
        <div class="h-8 bg-bg-hover w-1/4 rounded-md"></div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-7 h-[600px] bg-bg-hover rounded-3xl"></div>
          <div class="lg:col-span-5 h-[600px] bg-bg-hover rounded-3xl"></div>
        </div>
      </div>
    } @else if (auction(); as a) {
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-text-muted mb-6">
          <a routerLink="/auctions" class="hover:text-text-primary transition-colors">Subastas</a>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span class="text-text-primary">Subasta #{{ a.id }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          <!-- LEFT: Product Hero Image -->
          <div class="lg:col-span-7 space-y-6">
            <div class="aspect-[4/3] w-full glass-elevated rounded-3xl overflow-hidden border border-border/50 relative group bg-bg-hover">
              @if (product() && product()!.images && product()!.images!.length > 0) {
                <img [src]="product()!.images![0].url" [alt]="product()!.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                
                <div class="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              }
              
              <!-- Floating badges -->
              <div class="absolute top-4 left-4 flex gap-2">
                @if (a.status === 'ACTIVE') {
                  <div class="glass px-4 py-2 rounded-full flex items-center gap-2 border-success/30 shadow-glow">
                    <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span class="text-sm font-bold text-success uppercase tracking-wide">Subasta en Vivo</span>
                  </div>
                }
              </div>
            </div>
            
            @if (product()) {
              <div class="px-2">
                <h2 class="text-2xl font-bold mb-2">Acerca de este artículo</h2>
                <p class="text-text-secondary leading-relaxed">{{ product()!.description }}</p>
              </div>
            }
          </div>

          <!-- RIGHT: Auction Control Panel -->
          <div class="lg:col-span-5 relative">
            <div class="sticky top-24 glass-elevated rounded-3xl p-6 lg:p-8 border border-border shadow-2xl flex flex-col h-auto min-h-[600px]">
              
              <!-- Header -->
              <div class="mb-6">
                <h1 class="text-3xl lg:text-4xl font-display font-bold text-text-primary mb-2 line-clamp-2">
                  {{ product() ? product()!.name : 'Artículo de Subasta' }}
                </h1>
                <p class="text-text-muted">Vendido por Usuario #{{ a.sellerId }}</p>
              </div>
              
              <!-- Price & Countdown Area -->
              <div class="bg-bg-hover rounded-2xl p-6 mb-8 border border-border/50 relative overflow-hidden">
                <!-- Decorative glow -->
                @if (a.status === 'ACTIVE') {
                  <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                }

                <div class="relative z-10 flex flex-col gap-6">
                  <div>
                    <p class="text-sm text-text-secondary uppercase tracking-wider font-semibold mb-1">Oferta Actual</p>
                    <div class="flex items-baseline gap-2">
                      <span class="text-5xl font-display font-bold text-accent">{{ a.currentPrice | currency }}</span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center py-4 border-t border-border/50">
                    <div>
                      <p class="text-xs text-text-muted">Precio Inicial</p>
                      <p class="font-medium text-text-secondary">{{ a.startPrice | currency }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-text-muted text-right">Incremento Mínimo</p>
                      <p class="font-medium text-text-secondary text-right">{{ a.minIncrement | currency }}</p>
                    </div>
                  </div>
                  
                  <!-- Countdown -->
                  <div class="flex justify-between items-center bg-bg-elevated p-4 rounded-xl border border-border/30">
                    <span class="text-sm font-medium text-text-secondary flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Termina en
                    </span>
                    <span class="font-display font-bold text-xl tracking-tight text-text-primary font-mono"
                          [class.text-danger]="isEndingSoon()">
                      {{ timeRemainingDisplay() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Main CTA -->
              <div class="mb-8">
                @if (a.status === 'ACTIVE') {
                  <button (click)="openBidModal()" 
                          class="w-full h-14 rounded-xl text-lg font-bold text-white bg-primary hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-glow flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    Hacer Oferta
                  </button>
                  <p class="text-center text-xs text-text-muted mt-3">Oferta mínima siguiente: <span class="font-bold text-text-secondary">{{ a.currentPrice + a.minIncrement | currency }}</span></p>
                } @else if (canPay()) {
                  <button (click)="payAuction()"
                          [disabled]="isPaying()"
                          class="w-full h-14 rounded-xl text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-glow flex items-center justify-center gap-3 disabled:opacity-50">
                    @if (isPaying()) {
                      Pagando...
                    } @else {
                      Pagar subasta
                    }
                  </button>
                  <p class="text-center text-xs text-text-muted mt-3">Paga el precio final de la subasta para cerrar la transacción.</p>
                } @else {
                  <div class="w-full h-14 rounded-xl flex items-center justify-center font-bold border-2"
                       [ngClass]="{'bg-bg-hover text-text-muted border-border': a.status === 'CLOSED', 'bg-warning/10 text-warning border-warning/20': a.status === 'SCHEDULED'}">
                    {{ a.status === 'CLOSED' ? 'Subasta Cerrada' : 'Subasta Próximamente' }}
                  </div>
                }
              </div>

              <!-- Bid History -->
              <div class="flex-1 flex flex-col">
                <h3 class="font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
                  Historial de Ofertas <span class="text-xs font-normal text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{{ bids().length }}</span>
                </h3>
                
                <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[300px]">
                  @if (bids().length === 0) {
                    <p class="text-sm text-text-muted text-center py-8">Sin ofertas aún. ¡Sé el primero!</p>
                  } @else {
                    @for (bid of bids(); track bid.id; let first = $first) {
                      <div class="flex justify-between items-center p-3 rounded-lg border transition-colors"
                           [ngClass]="first ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-border/30 hover:bg-bg-hover'">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-bold">
                            U{{ bid.user_id }}
                          </div>
                          <div>
                            <p class="text-sm font-medium" [class.text-primary]="first">Usuario #{{ bid.user_id }}</p>
                            <p class="text-xs text-text-muted">{{ bid.created_at | date:'MMM d, h:mm a' }}</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="font-bold" [class.text-accent]="first">{{ bid.amount | currency }}</p>
                          <p class="text-[10px] uppercase tracking-wider font-bold" 
                             [ngClass]="{'text-success': bid.status === 'accepted', 'text-text-muted': bid.status !== 'accepted'}">
                            {{ bid.status }}
                          </p>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>

              <!-- Delete Auction -->
              @if (isSeller()) {
                <div class="mt-6 pt-6 border-t border-border/50">
                  <button (click)="openDeleteConfirm()"
                          class="w-full py-3 rounded-xl font-medium transition-colors border-2 border-danger/30 text-danger hover:bg-danger/10 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Eliminar Subasta
                  </button>
                </div>
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
            <h2 class="text-xl font-bold mb-2">Eliminar Subasta</h2>
            <p class="text-text-muted text-sm mb-6">¿Estás seguro de eliminar esta subasta? Esta acción no se puede deshacer.</p>
            <div class="flex gap-3">
              <button (click)="closeDeleteConfirm()"
                      class="flex-1 bg-bg-hover hover:bg-bg-elevated text-text-primary font-medium py-3 rounded-xl transition-colors border border-border">
                Cancelar
              </button>
              <button (click)="confirmDeleteAuction()" [disabled]="isDeleting()"
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

      <!-- Bid Modal Overlay -->
      @if (isBidModalOpen()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeBidModal()"></div>
          
          <div class="relative glass-elevated w-full max-w-md p-8 rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <button (click)="closeBidModal()" class="absolute top-4 right-4 text-text-muted hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-2 text-center">Haz tu oferta</h2>
            <p class="text-text-muted text-sm text-center mb-6">Ingresa un monto mayor a la oferta mínima.</p>
            
            <div class="bg-bg-hover rounded-xl p-4 mb-6 flex justify-between items-center">
              <span class="text-text-secondary text-sm">Precio Actual</span>
              <span class="font-bold text-accent text-xl">{{ a.currentPrice | currency }}</span>
            </div>

            <form [formGroup]="bidForm" (ngSubmit)="submitBid()">
              <div class="mb-6 relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                <input type="number" formControlName="amount"
                       class="w-full bg-transparent border-2 rounded-xl py-4 pl-8 pr-4 text-2xl font-bold font-mono focus:outline-none focus:border-primary transition-colors text-text-primary"
                       [class.border-danger]="bidForm.get('amount')?.touched && bidForm.get('amount')?.invalid"
                       [class.border-border]="!(bidForm.get('amount')?.touched && bidForm.get('amount')?.invalid)">
                
                @if (bidForm.get('amount')?.touched && bidForm.get('amount')?.hasError('min')) {
                  <p class="absolute -bottom-6 left-0 text-xs text-danger font-medium">
                    Debe ser al menos {{ a.currentPrice + a.minIncrement | currency }}
                  </p>
                }
              </div>
              
              <div class="grid grid-cols-3 gap-3 mb-8">
                <button type="button" (click)="addAmount(50)" class="bg-bg-hover hover:bg-bg-elevated border border-border py-2 rounded-lg text-sm font-medium transition-colors">+ $50</button>
                <button type="button" (click)="addAmount(100)" class="bg-bg-hover hover:bg-bg-elevated border border-border py-2 rounded-lg text-sm font-medium transition-colors">+ $100</button>
                <button type="button" (click)="addAmount(500)" class="bg-bg-hover hover:bg-bg-elevated border border-border py-2 rounded-lg text-sm font-medium transition-colors">+ $500</button>
              </div>

              <button type="submit" [disabled]="bidForm.invalid || isSubmittingBid()"
                      class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-glow disabled:opacity-50 flex justify-center items-center gap-2">
                @if (isSubmittingBid()) {
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                } @else {
                  Confirmar Oferta
                }
              </button>
            </form>
          </div>
        </div>
      }
    } @else {
      <div class="text-center py-24 glass rounded-3xl max-w-xl mx-auto">
        <h2 class="text-2xl font-bold text-text-primary mb-4">Subasta no encontrada</h2>
        <a routerLink="/auctions" class="text-primary hover:underline">Volver a Explorar</a>
      </div>
    }
  `
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auctionService = inject(AuctionService);
  private productService = inject(ProductService);
  private bidService = inject(BidService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  auction = signal<Auction | null>(null);
  product = signal<Product | null>(null);
  bids = signal<Bid[]>([]);
  
  isLoading = signal<boolean>(true);
  isBidModalOpen = signal<boolean>(false);
  isSubmittingBid = signal<boolean>(false);
  isPaying = signal<boolean>(false);
  isDeleteConfirmOpen = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  isSeller = computed(() => {
    const a = this.auction();
    const user = this.authService.currentUser();
    return a !== null && user !== null && a.sellerId === user.id;
  });

  canPay = computed(() => {
    const a = this.auction();
    const user = this.authService.currentUser();
    return a !== null && user !== null && a.status === 'CLOSED' && a.sellerId !== user.id;
  });
  
  timeRemaining = signal<number>(0);
  isEndingSoon = computed(() => this.timeRemaining() > 0 && this.timeRemaining() < 1000 * 60 * 60); // Less than 1 hr
  
  private timerSub?: Subscription;

  bidForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]]
  });

  // Calculate formatted time remaining
  timeRemainingDisplay = computed(() => {
    const diff = this.timeRemaining();
    if (diff <= 0) return '00:00:00';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    
    if (days > 0) return `${days}d ${h}:${m}:${s}`;
    return `${h}:${m}:${s}`;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(parseInt(id, 10));
    }
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  loadData(auctionId: number) {
    this.isLoading.set(true);
    
    this.auctionService.getAuction(auctionId).subscribe({
      next: (auctionData) => {
        this.auction.set(auctionData);
        
        // Start countdown timer
        this.setupTimer(auctionData.endTime);
        this.updateBidFormMin();

        // Load Product & Bids concurrently
        forkJoin({
          product: this.productService.getProduct(auctionData.productId),
          bids: this.bidService.getBidsForAuction(auctionId)
        }).subscribe({
          next: (res) => {
            if (res.product.success && res.product.data) {
              this.product.set(res.product.data);
            }
            if (res.bids.success && res.bids.data) {
              // Sort bids highest first
              const sortedBids = res.bids.data.sort((a, b) => b.amount - a.amount);
              this.bids.set(sortedBids);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  setupTimer(endTimeStr: string) {
    const end = new Date(endTimeStr).getTime();
    
    const updateTime = () => {
      const diff = end - new Date().getTime();
      this.timeRemaining.set(diff > 0 ? diff : 0);
    };
    
    updateTime();
    this.timerSub = interval(1000).subscribe(() => updateTime());
  }

  updateBidFormMin() {
    const currAuction = this.auction();
    if (currAuction) {
      const minBid = currAuction.currentPrice + currAuction.minIncrement;
      this.bidForm.get('amount')?.setValidators([Validators.required, Validators.min(minBid)]);
      this.bidForm.get('amount')?.setValue(minBid);
      this.bidForm.get('amount')?.updateValueAndValidity();
    }
  }

  openDeleteConfirm() {
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen.set(false);
  }

  payAuction() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Debes iniciar sesión para pagar la subasta');
      return;
    }

    const currAuction = this.auction();
    const currUser = this.authService.currentUser();

    if (!currAuction || !currUser) return;

    this.isPaying.set(true);
    this.paymentService.createPayment({
      auction_id: currAuction.id,
      user_id: currUser.id,
      amount: currAuction.currentPrice,
      payment_method: 'credit_card'
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastService.success('Pago creado con éxito');
          this.router.navigate(['/payments']);
        } else {
          this.toastService.error(res.message || 'No se pudo crear el pago');
        }
      },
      error: (err) => {
        const message = err.error?.message || 'Error al procesar el pago';
        this.toastService.error(message);
      },
      complete: () => {
        this.isPaying.set(false);
      }
    });
  }

  confirmDeleteAuction() {
    const a = this.auction();
    if (!a || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.auctionService.deleteAuction(a.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteConfirmOpen.set(false);
        this.toastService.success('Subasta eliminada correctamente');
        this.router.navigate(['/auctions']);
      },
      error: () => {
        this.isDeleting.set(false);
        this.toastService.error('Error al eliminar la subasta');
      }
    });
  }

  openBidModal() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Debes iniciar sesión para hacer una oferta');
      return;
    }
    this.updateBidFormMin();
    this.isBidModalOpen.set(true);
  }

  closeBidModal() {
    this.isBidModalOpen.set(false);
  }

  addAmount(val: number) {
    const current = this.bidForm.get('amount')?.value || 0;
    this.bidForm.get('amount')?.setValue(current + val);
  }

  submitBid() {
    if (this.bidForm.valid && !this.isSubmittingBid()) {
      const amount = this.bidForm.get('amount')?.value;
      const currAuction = this.auction();
      const currUser = this.authService.currentUser();
      
      if (!currAuction || !currUser || !amount) return;

      this.isSubmittingBid.set(true);
      
      this.bidService.placeBid(currAuction.id, currUser.id, amount, currAuction.sellerId).subscribe({
        next: (res) => {
          this.toastService.success('¡Oferta realizada con éxito!');
          this.closeBidModal();
          this.isSubmittingBid.set(false);
          
          // Optimistically reload the data to show the new bid and price
          this.loadData(currAuction.id);
        },
        error: (err) => {
          this.isSubmittingBid.set(false);
          const msg = err.error?.message || 'Error al realizar la oferta. Intenta de nuevo.';
          this.toastService.error(msg);
        }
      });
    }
  }
}
