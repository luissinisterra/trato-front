import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Bid } from '../models/auction.model';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private http = inject(HttpClient);

  getBidsForAuction(auctionId: number): Observable<ApiResponse<Bid[]>> {
    return this.http.get<ApiResponse<Bid[]>>(`${environment.apiUrl}/bids?auction_id=${auctionId}`);
  }

  placeBid(auctionId: number, userId: number, amount: number, ownerId?: number): Observable<ApiResponse<Bid>> {
    const payload: any = {
      auction_id: auctionId,
      user_id: userId,
      amount,
    };
    if (ownerId != null) {
      payload.owner_id = ownerId;
    }
    return this.http.post<ApiResponse<Bid>>(`${environment.apiUrl}/bids`, payload);
  }
}
