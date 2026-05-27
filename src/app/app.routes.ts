import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/create',
    loadComponent: () => import('./features/products/product-create/product-create.component').then(m => m.ProductCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auctions',
    loadComponent: () => import('./features/auctions/auction-list/auction-list.component').then(m => m.AuctionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auctions/:id',
    loadComponent: () => import('./features/auctions/auction-detail/auction-detail.component').then(m => m.AuctionDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payment-page/payment-page.component').then(m => m.PaymentPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/report-page/report-page.component').then(m => m.ReportPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'asesor',
    loadComponent: () => import('./features/agent/agent-chat/agent-chat.component').then(m => m.AgentChatComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
