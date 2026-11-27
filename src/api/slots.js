import client from './client';

/**
 * GET /slots for one day: the slots the server lets this user see, with their
 * `availability` (free, occupied, closed), ordered by facility and hour.
 * @param {{date: string, sportId: ?number, fromTime: ?string,
 *     toTime: ?string}} filter `date` as YYYY-MM-DD; null means no filter
 * @return {Promise<Array<Object>>}
 */
export async function getSlots({ date, sportId, fromTime, toTime }) {
  const params = { date };
  if (sportId) {
    params.sportId = sportId;
  }
  if (fromTime && toTime) {
    params.fromTime = fromTime;
    params.toTime = toTime;
  }
  const { data } = await client.get('/slots', { params });
  return data;
}
