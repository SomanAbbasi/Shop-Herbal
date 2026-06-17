import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';
import API_URL from '../config/api';

if (import.meta.env.DEV || window.location.hostname !== 'localhost') {
  console.log("API URL:", API_URL);
}

let accessToken: string | null = localStorage.getItem('accessToken');

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => accessToken;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const errorData = error.response.data as any;
      const errorCode = errorData?.error?.code;

      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'UNAUTHORIZED') {
        (originalRequest as any)._retry = true;
        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          
          if (refreshResponse.data?.status && refreshResponse.data?.data?.accessToken) {
            const newToken = refreshResponse.data.data.accessToken;
            setAccessToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          setAccessToken(null);
          return Promise.reject(refreshError);
        }
      }
      
      setAccessToken(null);
    }

    const errorData = error.response?.data as any;
    if (errorData?.message) {
      toast.error(errorData.message);
    } else if (errorData?.error?.message) {
      toast.error(errorData.error.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
