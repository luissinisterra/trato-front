import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Attach token if exists and it's not a refresh request
  const token = authService.accessToken();
  let authReq = req;
  
  if (token && !req.url.includes('/auth/refresh')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Set withCredentials for all requests by default (mostly for /auth/refresh cookie, but safe to have)
  authReq = authReq.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If error is 401 and it's NOT the refresh endpoint itself
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refresh().pipe(
            switchMap((success) => {
              isRefreshing = false;
              if (success) {
                refreshTokenSubject.next(authService.accessToken());
                // Retry the original request
                return next(req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${authService.accessToken()}`
                  },
                  withCredentials: true
                }));
              } else {
                authService.clearSession();
                router.navigate(['/login']);
                return throwError(() => error);
              }
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.clearSession();
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        } else {
          // Wait for the refresh to complete
          return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${jwt}`
                },
                withCredentials: true
              }));
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
