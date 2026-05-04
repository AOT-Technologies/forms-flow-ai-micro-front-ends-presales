import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const PROXY_API_URL = process.env.FORMS_FLOW_CUSTOM_SERVICES_URL || 'http://localhost:5005';

const apiInstance = axios.create({
  baseURL: PROXY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic API methods
export const ApiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiInstance.get<T>(url, config);
  },

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiInstance.post<T>(url, data, config);
  },

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiInstance.put<T>(url, data, config);
  },

  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiInstance.delete<T>(url, config);
  },

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiInstance.patch<T>(url, data, config);
  }
};

export default ApiClient;
