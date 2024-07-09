import axios from 'axios';
import { toast } from 'react-toastify';

import type { APIResponse } from '@/types/api';

import { logger } from './default-logger';

type Params = Record<never, never>;

const headers = { 'Content-Type': 'application/json' };

// TODO - What if more than 10000ms is needed? execute script in the backend
const INSTANCE = axios.create({
  timeout: 60000,
  baseURL: 'http://localhost:8080',
  headers,
});

INSTANCE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('custom-auth-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
INSTANCE.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.config.url}`, response.data);
    return Promise.resolve(response);
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface RequestParams {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Params;
  data?: Params;
}

function request<T>(requestParams: RequestParams, download = false): Promise<APIResponse<T>> {
  const { url, method, params, data } = requestParams;
  return new Promise((resolve, reject) => {
    const isPostOrPut = method === 'POST' || method === 'PUT';
    const requestData = isPostOrPut ? { data, params } : {};
    const myRequestParams = !isPostOrPut ? { params } : {};
    const isFormData = data instanceof FormData;
    const options = {
      url,
      method,
      ...requestData,
      ...myRequestParams,
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      responseType: download ? 'blob' : 'json',
    };
    // generate API Logs
    logger.debug(`API Request: ${method} ${url}`, options);
    INSTANCE(options)
      .then((response) => {
        const data2 = response.data as APIResponse<T>;
        if (!data2.success) {
          toast.error(data2.message);
        }

        resolve(data2);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export default request;
