import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiResponse, ApiError } from './php-backend.types';

@Injectable()
export class PhpBackendClient {
  private readonly logger = new Logger(PhpBackendClient.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl =
      this.configService.get<string>('phpBackend.baseUrl', { infer: true }) ??
      '';
    this.apiToken =
      this.configService.get<string>('phpBackend.apiToken', { infer: true }) ??
      '';
    this.timeout =
      this.configService.get<number>('phpBackend.timeout', { infer: true }) ??
      5000;
    this.retries =
      this.configService.get<number>('phpBackend.retries', { infer: true }) ??
      3;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
      headers: this.getHeaders(),
      ...config,
    };

    this.logger.debug(`GET ${url}`);

    try {
      const response: AxiosResponse<ApiResponse<T>> = await firstValueFrom(
        this.httpService.get<ApiResponse<T>>(url, requestConfig)
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      this.logger.error(`GET ${url} failed: ${(error as Error).message}`);
      throw this.handleError(error);
    }
  }

  async post<T>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
      headers: this.getHeaders(),
      ...config,
    };

    this.logger.debug(`POST ${url}`, data);

    try {
      const response: AxiosResponse<ApiResponse<T>> = await firstValueFrom(
        this.httpService.post<ApiResponse<T>>(url, data, requestConfig)
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      this.logger.error(`POST ${url} failed: ${(error as Error).message}`);
      throw this.handleError(error);
    }
  }

  async put<T>(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
      headers: this.getHeaders(),
      ...config,
    };

    this.logger.debug(`PUT ${url}`, data);

    try {
      const response: AxiosResponse<ApiResponse<T>> = await firstValueFrom(
        this.httpService.put<ApiResponse<T>>(url, data, requestConfig)
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      this.logger.error(`PUT ${url} failed: ${(error as Error).message}`);
      throw this.handleError(error);
    }
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
      headers: this.getHeaders(),
      ...config,
    };

    this.logger.debug(`DELETE ${url}`);

    try {
      const response: AxiosResponse<ApiResponse<T>> = await firstValueFrom(
        this.httpService.delete<ApiResponse<T>>(url, requestConfig)
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      this.logger.error(`DELETE ${url} failed: ${(error as Error).message}`);
      throw this.handleError(error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const { data } = response;

    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      const apiError: ApiError = data;

      return new Error(
        `PHP Backend API Error (${status}): ${apiError.message || 'Unknown error'}`
      );
    }

    if (error.request) {
      return new Error('No response received from PHP Backend API');
    }

    return new Error(`Request failed: ${error.message}`);
  }
}
