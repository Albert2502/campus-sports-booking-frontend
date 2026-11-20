import client from './client';

/**
 * POST /auth/login.
 * @param {string} email
 * @param {string} password
 * @return {Promise<{token: string, expiresAt: string, user: Object}>}
 */
export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}
