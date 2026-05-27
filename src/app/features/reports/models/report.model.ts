export type ReportType = 'auction_history' | 'bid_history' | 'earnings' | 'sales_summary';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: number;
  user_id: number;
  type: ReportType;
  data: Record<string, unknown>;
  status?: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface ReportRequest {
  id: number;
  user_id: number;
  report_type: ReportType;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}
