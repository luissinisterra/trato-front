export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
