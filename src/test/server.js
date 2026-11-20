import { setupServer } from 'msw/node';

// Each test declares the API answers it needs with server.use(...).
export const server = setupServer();
