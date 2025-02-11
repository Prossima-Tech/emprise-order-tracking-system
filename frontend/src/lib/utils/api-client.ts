import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../config/constants';
import { ROUTES } from '../config/routes';

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== ROUTES.LOGIN) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
