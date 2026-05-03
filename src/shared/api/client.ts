import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as Sentry from '@sentry/react';
import { API_BASE_URL } from '@/config';



export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    Sentry.addBreadcrumb({
      category: 'http',
      message: `➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      level: 'info',
      data: {
        withCredentials: config.withCredentials,
        headers: config.headers,
        baseURL: config.baseURL,
      },
    });
    return config;
  },
  (error) => {
    Sentry.captureException(error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    Sentry.addBreadcrumb({
      category: 'http',
      message: `⬅️ ${response.status} ${response.config.url}`,
      level: 'info',
      data: {
        status: response.status,
        headers: response.headers,
      },
    });
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      Sentry.addBreadcrumb({
        category: 'http',
        message: `❌ ${status} ${error.config?.url}`,
        level: 'error',
        data: {
          status,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          withCredentials: error.config?.withCredentials,
          responseHeaders: error.response.headers,
          data: error.response.data,
        },
      });

      if (status === 401 && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      if (status === 403) {
        Sentry.captureException(error, { extra: { data: error.response.data } });
      }
      if (status >= 500) {
        Sentry.captureException(error, { extra: { data: error.response.data } });
      }
    } else if (error.request) {
      Sentry.captureException(error, {
        extra: {
          message: error.message,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          withCredentials: error.config?.withCredentials,
        },
      });
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default api;
