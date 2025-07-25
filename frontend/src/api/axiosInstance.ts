import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const config = error.config;
      // Sadece gerçek oturum hatalarında token'ı sil
      const isAuthEndpoint =
        config?.url?.includes('/auth/me') ||
        config?.url?.includes('/auth/login') ||
        config?.url?.includes('/auth/register');
      if (isAuthEndpoint) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
      }
      // Yönlendirme yok, hata mesajı frontendde gösterilecek
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 