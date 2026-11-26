import client from './client';

/**
 * GET /sports: the sports facilities can belong to.
 * @return {Promise<Array<{id: number, name: string}>>}
 */
export async function getSports() {
  const { data } = await client.get('/sports');
  return data;
}
