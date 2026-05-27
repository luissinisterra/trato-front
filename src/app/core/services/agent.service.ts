import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatResponse {
  response: string;
  session_id: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private http = inject(HttpClient);

  sendMessage(query: string, sessionId?: string): Observable<ChatResponse> {
    return this.http.post<{ success: boolean; data: ChatResponse }>(
      `${environment.apiUrl}/agents/chat`,
      { query, session_id: sessionId || null }
    ).pipe(map(res => res.data));
  }
}
