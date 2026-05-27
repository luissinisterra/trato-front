import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

const SILENT_STATUSES = [0, 401, 404, 502, 503, 504];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!SILENT_STATUSES.includes(error.status)) {
        let errorMessage = 'Ocurrió un error inesperado';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          errorMessage = error.error.errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }

        toastService.error(errorMessage, 'Solicitud Fallida');
      }

      return throwError(() => error);
    })
  );
};
