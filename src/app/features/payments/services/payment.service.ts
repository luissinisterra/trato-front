import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Payment, PaymentMethod } from '../models/payment.model';

export interface CreatePaymentPayload {
  auction_id: number;
  amount: number;
  payment_method: PaymentMethod;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  createPayment(payload: CreatePaymentPayload): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${environment.apiUrl}/payments`, payload);
  }

  getPaymentsByAuction(auctionId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${environment.apiUrl}/payments/auction/${auctionId}`);
  }

  getPaymentById(paymentId: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${environment.apiUrl}/payments/${paymentId}`);
  }

  updatePaymentStatus(paymentId: number, status: string): Observable<ApiResponse<Payment>> {
    return this.http.put<ApiResponse<Payment>>(`${environment.apiUrl}/payments/${paymentId}`, { status });
  }

  getPaymentLogs(paymentId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/payments/${paymentId}/logs`);
  }
}
