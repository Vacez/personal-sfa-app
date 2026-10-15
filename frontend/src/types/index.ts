export type AppMode = 'VIP_HOSPITALITY' | 'B2B_CONSULTING';

export interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  default_mode: AppMode;
  monthly_sales_quota: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  mode: AppMode;
  sort_order: number;
  win_probability_rate: number;
  is_system_default?: boolean;
  contacts_count?: number;
  total_expected?: number;
  weighted_total?: number;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  user_id?: string;
  name: string;
  display_name?: string;
  contact_mode: AppMode;
  phone?: string;
  sns_account?: string;
  birthday?: string;
  expected_amount: number;
  lifetime_sales_amount: number;
  custom_attributes?: Record<string, any>;
  last_contacted_at?: string;
  current_stage_id?: string;
  stage?: PipelineStage;
  created_at?: string;
  interaction_logs?: InteractionLog[];
  transactions?: Transaction[];
}

export interface InteractionLog {
  id: string;
  contact_id: string;
  template_id?: string;
  channel: 'LINE' | 'INSTAGRAM_DM' | 'EMAIL' | 'PHONE' | 'IN_PERSON';
  notes?: string;
  interacted_at: string;
  template?: MessageTemplate;
}

export interface SocialAccount {
  id: string;
  platform: 'INSTAGRAM' | 'X_TWITTER';
  account_username: string;
  is_active: boolean;
}

export interface SocialPost {
  id: string;
  external_post_id: string;
  post_url?: string;
  caption?: string;
  posted_at: string;
  impressions_count: number;
  likes_count: number;
  attributed_sales_amount: number;
  social_account?: SocialAccount;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  mode: AppMode;
  used_count: number;
  converted_count: number;
  cvr_percentage: number;
}

export interface Transaction {
  id: string;
  contact_id?: string;
  attributed_social_post_id?: string;
  amount: number;
  payment_method: 'CASH' | 'CREDIT_CARD' | 'RECEIVABLE';
  is_settled: boolean;
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
  transaction_date: string;
  metadata?: Record<string, any>;
  contact?: Contact;
  attributed_social_post?: SocialPost;
}

export interface ForecastData {
  quota: number;
  confirmed_sales: number;
  weighted_forecast: number;
  projected_finish: number;
  pacing_percentage: number;
  confirmed_percentage: number;
  month: string;
}

export interface AlertsData {
  birthdays: Contact[];
  inactive_clients: Contact[];
  stalled_deals: Contact[];
  summary: {
    total_alerts: number;
    birthdays_count: number;
    inactive_count: number;
    stalled_count: number;
  };
}
