import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notification, UnreadCount, NotificationsResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  getNotifications(page = 1, limit = 20): Observable<NotificationsResponse> {
    return this.http.get<{ success: boolean; data: Notification[]; pagination: NotificationsResponse['pagination'] }>(
      `${environment.apiUrl}/notifications?page=${page}&limit=${limit}`
    ).pipe(
      map(res => ({
        success: res.success,
        data: res.data,
        pagination: res.pagination
      }))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<UnreadCount>>(`${environment.apiUrl}/notifications/unread-count`)
      .pipe(map(res => res.data?.count ?? 0));
  }

  markAsRead(id: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${environment.apiUrl}/notifications/${id}/read`, {});
  }
}
