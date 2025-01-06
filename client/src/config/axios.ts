// src/config/axios.ts
import axios from 'axios';
import { config } from './index';
import { message } from 'antd';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: `${config.API_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (requestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
    if (token) {
      // Set the Authorization header correctly
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Return the data directly if it's wrapped in a success response
    if (response.data && response.data.success) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      message.error('Session expired. Please login again.');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;