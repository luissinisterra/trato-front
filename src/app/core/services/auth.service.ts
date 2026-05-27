import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User, AuthResponse } from '../models/user.model';
import { LoginDto, RegisterDto } from '../../features/auth/models/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backend = inject(HttpBackend);
  private refreshHttp = new HttpClient(this.backend); // Bypasses interceptors to avoid circular DI
  
  // State
  private currentUserSignal = signal<User | null>(null);
  private accessTokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(true); // initially true while checking session

  // Computed
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    this.refresh().subscribe({
      next: () => this.loadingSignal.set(false),
      error: () => this.loadingSignal.set(false)
    });
  }

  login(dto: LoginDto): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, dto, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data.user, response.data.accessToken);
        }
      })
    );
  }

  register(dto: RegisterDto): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, dto, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data.user, response.data.accessToken);
        }
      })
    );
  }

  refresh(): Observable<boolean> {
    return this.refreshHttp.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data.user, response.data.accessToken);
        }
      }),
      map(response => response.success),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of({ success: true } as ApiResponse<void>);
      })
    );
  }

  private setSession(user: User, token: string) {
    this.currentUserSignal.set(user);
    this.accessTokenSignal.set(token);
  }

  clearSession() {
    this.currentUserSignal.set(null);
    this.accessTokenSignal.set(null);
  }
}
