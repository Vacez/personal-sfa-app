import { apiClient } from './apiClient';
import {
  AlertsData,
  AppMode,
  Contact,
  ForecastData,
  MessageTemplate,
  PipelineStage,
  SocialPost,
  Transaction,
  User,
} from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password });
    apiClient.setToken(res.token);
    return res;
  },

  async register(data: {
    email: string;
    password: string;
    name?: string;
    default_mode: AppMode;
  }): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/register', data);
    apiClient.setToken(res.token);
    return res;
  },

  async getMe(): Promise<User> {
    return apiClient.get('/auth/me');
  },

  async updateMode(mode: AppMode): Promise<{ message: string; default_mode: AppMode }> {
    return apiClient.patch('/auth/mode', { mode });
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },
};

export const sfaService = {
  // Dashboard & Forecast
  async getForecast(): Promise<ForecastData> {
    return apiClient.get('/dashboard/forecast');
  },

  async getAlerts(): Promise<AlertsData> {
    return apiClient.get('/dashboard/alerts');
  },

  // Contacts & Timeline
  async getContacts(sortBy: 'ltv' | 'last_contacted' | 'name' = 'ltv', mode?: AppMode): Promise<Contact[]> {
    const query = new URLSearchParams();
    if (sortBy) query.append('sort_by', sortBy);
    if (mode) query.append('mode', mode);
    return apiClient.get(`/contacts?${query.toString()}`);
  },

  async getContact(id: string): Promise<Contact> {
    return apiClient.get(`/contacts/${id}`);
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    return apiClient.post('/contacts', data);
  },

  async logInteraction(
    contactId: string,
    data: {
      channel: 'LINE' | 'INSTAGRAM_DM' | 'EMAIL' | 'PHONE' | 'IN_PERSON';
      template_id?: string;
      notes?: string;
    }
  ): Promise<{ message: string; contact: Contact }> {
    return apiClient.post(`/contacts/${contactId}/interactions`, data);
  },

  // Pipeline & Deals
  async getPipeline(mode?: AppMode): Promise<{
    mode: AppMode;
    total_pipeline: number;
    total_weighted: number;
    stages: PipelineStage[];
  }> {
    const query = mode ? `?mode=${mode}` : '';
    return apiClient.get(`/pipeline/stages${query}`);
  },

  async updateContactStage(contactId: string, stageId: string): Promise<{ contact: Contact }> {
    return apiClient.patch(`/pipeline/contacts/${contactId}/stage`, { stage_id: stageId });
  },

  // Growth & Social Attribution
  async getSocialPosts(): Promise<SocialPost[]> {
    return apiClient.get('/social/posts');
  },

  async syncSocial(forceMock: boolean = false): Promise<{ message: string; posts: SocialPost[] }> {
    return apiClient.post('/social/sync', { force_mock: forceMock });
  },

  async getTemplateAnalytics(mode?: AppMode): Promise<MessageTemplate[]> {
    const query = mode ? `?mode=${mode}` : '';
    return apiClient.get(`/templates/analytics${query}`);
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return apiClient.get('/transactions');
  },

  async recordTransaction(data: {
    contact_id: string;
    amount: number;
    payment_method: 'CASH' | 'CREDIT_CARD' | 'RECEIVABLE';
    transaction_date: string;
    attributed_social_post_id?: string;
    is_settled?: boolean;
    metadata?: Record<string, any>;
  }): Promise<{ message: string; transaction: Transaction }> {
    return apiClient.post('/transactions', data);
  },

  async settleTransaction(id: string): Promise<{ message: string; transaction: Transaction }> {
    return apiClient.patch(`/transactions/${id}/settle`);
  },
};
