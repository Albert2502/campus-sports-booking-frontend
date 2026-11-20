import axios from 'axios';

// Same origin as the app: the Vite dev server proxies /api to the backend.
const client = axios.create({ baseURL: '/api/v1' });

export default client;
