import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Auction } from '../models/auction.model';

export interface CreateAuctionRequest {
  productId: number;
  sellerId: number;
  startPrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private http = inject(HttpClient);

  // Note: The Java backend returns the array directly, not wrapped in { success, data }
  getAuctions(): Observable<Auction[]> {
    return this.http.get<any>(`${environment.apiUrl}/auctions`).pipe(
      map(res => {
        // Handle both cases just in case the gateway wraps it later
        if (res && res.success !== undefined && res.data) {
          return res.data;
        }
        return Array.isArray(res) ? res : [];
      })
    );
  }

  getAuction(id: number): Observable<Auction> {
    return this.http.get<any>(`${environment.apiUrl}/auctions/${id}`).pipe(
      map(res => {
        if (res && res.success !== undefined && res.data) {
          return res.data;
        }
        return res;
      })
    );
  }

  createAuction(data: CreateAuctionRequest): Observable<Auction> {
    return this.http.post<Auction>(`${environment.apiUrl}/auctions`, data);
  }

  deleteAuction(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/auctions/${id}`);
  }
}
