import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(page = 1, limit = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${environment.apiUrl}/products?page=${page}&limit=${limit}`);
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`);
  }

  createProduct(data: { name: string; description?: string; base_price: number; owner_id: number; image_urls?: string[] }): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiUrl}/products`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/products/${id}`);
  }
}
