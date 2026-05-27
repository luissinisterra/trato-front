import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuctionService } from '../services/auction.service';
import { Auction, AuctionStatus } from '../models/auction.model';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-display font-bold tracking-tight text-text-primary">Explorar Subastas</h1>
        <p class="mt-2 text-text-muted">Ofertas en vivo en artículos exclusivos.</p>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="glass-elevated rounded-2xl p-5 space-y-4 animate-pulse">
              <div class="flex justify-between items-center">
                <div class="h-6 bg-bg-hover rounded-full w-24"></div>
                <div class="h-4 bg-bg-hover rounded-full w-16"></div>
              </div>
              <div class="space-y-2 py-4 border-y border-border/50">
                <div class="h-8 bg-bg-hover rounded-md w-1/2"></div>
                <div class="h-4 bg-bg-hover rounded-md w-1/3"></div>
              </div>
              <div class="h-10 bg-bg-hover rounded-xl w-full"></div>
            </div>
          }
        </div>
      } @else if (auctions().length === 0) {
        <div class="text-center py-24 glass-elevated rounded-3xl border border-border/50 max-w-2xl mx-auto">
          <div class="w-20 h-20 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
              <path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">No se encontraron subastas</h3>
          <p class="text-text-muted max-w-sm mx-auto">No hay subastas activas en este momento. Vuelve más tarde.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (auction of auctions(); track auction.id) {
            <a [routerLink]="['/auctions', auction.id]" class="group glass-elevated rounded-2xl p-5 flex flex-col hover:border-primary/50 transition-all hover:shadow-glow hover:-translate-y-1 relative overflow-hidden">
              <!-- Glow effect for ACTIVE -->
              @if (auction.status === 'ACTIVE') {
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-success/20 blur-3xl rounded-full"></div>
              }
              
              <div class="flex justify-between items-start mb-4 relative z-10">
                <span [class]="getStatusClasses(auction.status)">
                  @if (auction.status === 'ACTIVE') {
                    <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                  }
                  {{ auction.status }}
                </span>
                <span class="text-xs text-text-muted">ID: {{ auction.id }}</span>
              </div>
              
              <div class="py-4 border-y border-border/50 relative z-10">
                <p class="text-sm text-text-muted mb-1">Oferta Actual</p>
                <p class="text-3xl font-display font-bold text-accent group-hover:text-primary transition-colors">
                  {{ auction.currentPrice | currency }}
                </p>
                <div class="flex justify-between items-center mt-3 text-sm">
                  <span class="text-text-secondary">Termina en</span>
                  <span class="font-medium text-text-primary">{{ getTimeRemaining(auction.endTime) }}</span>
                </div>
              </div>
              
              <div class="mt-4 pt-2 relative z-10">
                <button class="w-full py-2.5 rounded-xl font-medium transition-colors"
                        [ngClass]="auction.status === 'ACTIVE' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-bg-hover text-text-muted'">
                  {{ auction.status === 'ACTIVE' ? 'Hacer Oferta' : 'Ver Detalles' }}
                </button>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class AuctionListComponent implements OnInit {
  private auctionService = inject(AuctionService);

  auctions = signal<Auction[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadAuctions();
  }

  loadAuctions() {
    this.isLoading.set(true);
    this.auctionService.getAuctions().subscribe({
      next: (data) => {
        this.auctions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusClasses(status: AuctionStatus): string {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md';
    switch (status) {
      case 'ACTIVE': return `${base} bg-success/10 text-success border-success/20`;
      case 'CLOSED': return `${base} bg-bg-hover text-text-muted border-border`;
      case 'SCHEDULED': return `${base} bg-warning/10 text-warning border-warning/20`;
      case 'CANCELLED': return `${base} bg-danger/10 text-danger border-danger/20`;
      default: return `${base} bg-primary/10 text-primary border-primary/20`;
    }
  }

  getTimeRemaining(endTimeStr: string): string {
    const end = new Date(endTimeStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
