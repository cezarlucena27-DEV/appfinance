import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch (refreshErr: any) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          const msg = refreshErr?.response?.data?.message || error?.response?.data?.message;
          if (msg) sessionStorage.setItem('loginError', msg);
          window.location.href = '/login';
        }
      } else {
        const msg = error?.response?.data?.message;
        if (msg) sessionStorage.setItem('loginError', msg);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
