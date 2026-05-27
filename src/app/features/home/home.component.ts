import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-24 pb-12">
      <!-- Hero Section -->
      <section class="relative min-h-[80vh] flex items-center justify-center pt-16 overflow-hidden">
        <!-- Abstract Background -->
        <div class="absolute inset-0 -z-10">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full mix-blend-screen"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full mix-blend-screen"></div>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        </div>

        <div class="max-w-5xl mx-auto px-4 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold tracking-wide mb-8">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            El Futuro de las Subastas Digitales
          </div>
          
          <h1 class="text-6xl md:text-8xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-8 leading-tight">
            Puja por <br class="hidden md:block"/> Activos Digitales Exclusivos
          </h1>
          
          <p class="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            TRATO es la plataforma líder para artículos de alto valor, ofreciendo pujas en tiempo real, transacciones seguras y autenticidad verificada.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/auctions" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-glow text-lg">
              Explorar Subastas
            </a>
            <a routerLink="/register" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-text-primary bg-bg-elevated border border-border hover:bg-bg-hover transition-all text-lg">
              Empezar a Vender
            </a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div class="glass-elevated rounded-3xl p-8 border border-border/50 hover:border-primary/50 transition-colors group">
            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Pujas en Tiempo Real</h3>
            <p class="text-text-secondary leading-relaxed">Experimenta la emoción de las subastas en vivo con actualizaciones instantáneas y cuenta regresiva sincronizada impulsada por nuestra infraestructura de alto rendimiento.</p>
          </div>

          <div class="glass-elevated rounded-3xl p-8 border border-border/50 hover:border-accent/50 transition-colors group">
            <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Plataforma Segura</h3>
            <p class="text-text-secondary leading-relaxed">Tus transacciones y datos están protegidos por protocolos de seguridad líderes. Verificamos a todos los vendedores para garantizar un mercado seguro.</p>
          </div>

          <div class="glass-elevated rounded-3xl p-8 border border-border/50 hover:border-success/50 transition-colors group">
            <div class="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Activos Premium</h3>
            <p class="text-text-secondary leading-relaxed">Descubre activos digitales seleccionados de alta calidad. Desde licencias de software exclusivas hasta coleccionables digitales raros, encuentra lo que necesitas.</p>
          </div>

        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="max-w-5xl mx-auto px-4 pb-24">
        <div class="glass rounded-3xl p-12 text-center relative overflow-hidden border border-primary/30">
          <div class="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
          <div class="relative z-10">
            <h2 class="text-4xl font-display font-bold mb-6">¿Listo para unirte a la acción?</h2>
            <p class="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">Crea una cuenta hoy para empezar a pujar por artículos exclusivos o vender tus propios activos digitales.</p>
            <a routerLink="/register" class="inline-block px-8 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-glow text-lg">
              Crear Cuenta Gratis
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {
}
