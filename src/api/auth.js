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

/**
 * POST /auth/password-reset: always 202, whether or not the email exists.
 * @param {string} email
 * @return {Promise<void>}
 */
export async function requestPasswordReset(email) {
  await client.post('/auth/password-reset', { email });
}

/**
 * POST /auth/password-reset/confirm: 204, or 410 RESET_TOKEN_INVALID.
 * @param {string} token from the emailed link
 * @param {string} newPassword
 * @return {Promise<void>}
 */
export async function confirmPasswordReset(token, newPassword) {
  await client.post('/auth/password-reset/confirm', { token, newPassword });
}
