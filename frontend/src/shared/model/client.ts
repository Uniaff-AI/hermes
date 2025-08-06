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

// Base client implementation
const createClient = (basePath: string) => ({
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

    try {
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
    } catch (error) {
      console.error(`API request failed for ${fullUrl}:`, error);
      // Return a safe default response to prevent filter errors
      const safeResponse: Response<T> = {
        data: [] as unknown as T, // Safe default for arrays
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config,
      };
      return safeResponse;
    }
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
});

// Frontend API client - for Next.js API routes (get_products, get_leads)
// These routes are served by the frontend on port 3003
const frontendBasePath = isDevelopment
  ? ENV_CONFIG.FRONTEND_URL // http://localhost:3003
  : ENV_CONFIG.FRONTEND_URL; // Production frontend URL

// Backend API client - for backend API routes (rules, health, etc.)
// These routes are served by the backend on port 3004
const backendBasePath = isDevelopment
  ? ENV_CONFIG.BACKEND_URL // http://localhost:3004/api
  : ENV_CONFIG.BACKEND_URL; // Production backend URL

// Frontend API client (for Next.js API routes)
export const frontendClient = createClient(frontendBasePath);

// Backend API client (for NestJS API routes)
export const backendClient = createClient(backendBasePath);

// Default client - backwards compatibility (uses backend)
export const client = backendClient;
