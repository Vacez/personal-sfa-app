import { getApiBaseUrl } from '../constants/api';

class ApiClient {
  private token: string | null = null;

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP error ${response.status}`;
        const error = new Error(errorMsg);
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }

      return data as T;
    } catch (error: any) {
      console.warn(`[ApiClient] Request failed for ${options.method || 'GET'} ${url}:`, error.message);
      throw error;
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  public patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
