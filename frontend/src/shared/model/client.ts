import { ENV_CONFIG, isDevelopment } from '@/config/envConfig';

export interface RequestConfig {
  url?: string;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  responseType?: string;
  withCredentials?: boolean;
  [key: string]: unknown;
}

export interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}
const basePath = isDevelopment ? '/api' : process.env.API_ENDPOINT;

export const client = {
  async request<T = unknown>(config: RequestConfig): Promise<Response<T>> {
    const { url, method = 'GET', data, headers = {}, params } = config;

    let fullUrl = `${basePath}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, String(item)));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && data !== undefined) {
      if (data instanceof FormData) {
        fetchOptions.body = data;
      } else {
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Content-Type': 'application/json',
        };
      }
    }

    const response = await fetch(fullUrl, fetchOptions);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseData: T;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = (await response.text()) as unknown as T;
    }

    const clientResponse: Response<T> = {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      config,
    };

    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
      (error as any).response = clientResponse;
      throw error;
    }

    return clientResponse;
  },

  async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  },

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
  ): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  },

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
  ): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  },

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
  ): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  },

  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  },
};
