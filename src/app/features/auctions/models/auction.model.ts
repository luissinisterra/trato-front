import { Product } from '../../products/models/product.model';

export type AuctionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface Auction {
  id: number;
  productId: number;
  sellerId: number;
  startPrice: number;
  currentPrice: number;
  minIncrement: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  // Included by some endpoints or hydrated locally
  product?: Product;
}

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  status: BidStatus;
  created_at: string;
  updated_at: string;
}
