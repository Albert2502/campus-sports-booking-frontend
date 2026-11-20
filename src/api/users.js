import client from './client';

/**
 * GET /users/me: the profile, account status and this month's bookings.
 * @return {Promise<Object>}
 */
export async function getMe() {
  const { data } = await client.get('/users/me');
  return data;
}
