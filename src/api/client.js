import axios from 'axios';

import { readToken } from '../auth/token-storage';

// Same origin as the app: the Vite dev server proxies /api to the backend.
const client = axios.create({ baseURL: '/api/v1' });

client.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
