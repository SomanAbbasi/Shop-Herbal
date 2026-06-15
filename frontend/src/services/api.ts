import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api/v1';
//const API_BASE_URL = 'https://shop-herbal.vercel.app/api/v1';


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
  baseURL: API_BASE_URL,
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
            `${API_BASE_URL}/auth/refresh`,
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
    if (errorData?.error?.message) {
      toast.error(errorData.error.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
