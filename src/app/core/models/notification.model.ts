export interface Notification {
  _id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface UnreadCount {
  count: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: PaginationInfo;
}
