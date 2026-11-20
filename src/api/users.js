import client from './client';

/**
 * GET /users/me: the profile, account status and this month's bookings.
 * @return {Promise<Object>}
 */
export async function getMe() {
  const { data } = await client.get('/users/me');
  return data;
}

/**
 * POST /users/me/password: 204 on success, 422 WRONG_PASSWORD when the
 * current password is wrong.
 * @param {string} currentPassword
 * @param {string} newPassword
 * @return {Promise<void>}
 */
export async function changePassword(currentPassword, newPassword) {
  await client.post('/users/me/password', { currentPassword, newPassword });
}
