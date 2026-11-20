import client from './client';

/**
 * GET /facilities: the active facilities, sorted by name.
 * @return {Promise<Array<Object>>}
 */
export async function getFacilities() {
  const { data } = await client.get('/facilities');
  return data;
}
