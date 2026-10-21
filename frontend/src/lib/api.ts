import axios from 'axios';

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        accessToken = data.accessToken;
        return data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const PUBLIC_AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url: string = error.config?.url || '';
    const isPublicAuth = PUBLIC_AUTH_ROUTES.some((route) => url.includes(route));
    if (error.response?.status === 401 && !isPublicAuth && !error.config?._retry) {
      error.config._retry = true;
      try {
        const token = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${token}`;
        return api(error.config);
      } catch (refreshErr: any) {
        accessToken = null;
        const msg = refreshErr?.response?.data?.message || error?.response?.data?.message;
        if (msg) sessionStorage.setItem('loginError', msg);
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
