import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Report, ReportRequest, ReportType } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);

  generateReport(type: ReportType): Observable<ApiResponse<Report>> {
    return this.http.post<ApiResponse<Report>>(`${environment.apiUrl}/reports/generate`, { type });
  }

  getUserReports(userId: number): Observable<ApiResponse<Report[]>> {
    return this.http.get<ApiResponse<Report[]>>(`${environment.apiUrl}/reports/user/${userId}`);
  }

  getPendingRequests(userId: number): Observable<ApiResponse<ReportRequest[]>> {
    return this.http.get<ApiResponse<ReportRequest[]>>(`${environment.apiUrl}/reports/user/${userId}/pending`);
  }

  deleteReport(reportId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/reports/${reportId}`);
  }

  getReportById(reportId: number): Observable<ApiResponse<Report>> {
    return this.http.get<ApiResponse<Report>>(`${environment.apiUrl}/reports/${reportId}`);
  }
}
