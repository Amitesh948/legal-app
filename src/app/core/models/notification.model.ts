export interface NotificationPreference {
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
  case_updates_enabled: boolean;
  document_updates_enabled: boolean;
  ai_updates_enabled: boolean;
  report_updates_enabled: boolean;
  payment_updates_enabled: boolean;
  account_updates_enabled: boolean;
  marketing_updates_enabled: boolean;
  system_updates_enabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  channel: string;
  priority: number;
  type: string; // INFO, SUCCESS, WARNING, ERROR
  category?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  meta_data?: any;
  status: string;
  is_read: boolean;
  read_at?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unread_count: number;
}
