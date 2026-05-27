export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  base_price: number;
  owner_id: number;
  status: string; // 'ACTIVE' | 'INACTIVE'
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}
