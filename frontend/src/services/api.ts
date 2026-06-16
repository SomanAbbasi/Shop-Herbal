import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';


// Determine if we are running on localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API Base URL priority:
// 1. VITE_API_BASE_URL (if it doesn't point to vercel while on localhost)
// 2. Automatic Localhost fallback
// 3. Production default
const envApiUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (isLocalhost && (!envApiUrl || envApiUrl.includes('vercel.app')))
  ? 'http://localhost:5000/api/v1'
  : (envApiUrl || 'https://shop-herbal.vercel.app/api/v1');

if (import.meta.env.DEV) {
  console.log('Detected Environment:', isLocalhost ? 'Local' : 'Remote');
  console.log('API Base URL:', API_BASE_URL);
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
