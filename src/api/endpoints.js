import client from './client';

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function getMe() {
  const { data } = await client.get('/users/me');
  return data;
}

export async function getFacilities(status = 'active') {
  const { data } = await client.get('/facilities', { params: { status } });
  return data;
}

export async function getFacility(facilityId) {
  const { data } = await client.get(`/facilities/${facilityId}`);
  return data;
}

/**
 * @param {number} facilityId
 * @param {string} date YYYY-MM-DD
 */
export async function getSlots(facilityId, date) {
  const { data } = await client.get('/slots', {
    params: { facilityId, date },
  });
  return data;
}

export async function createBooking(slotId) {
  const { data } = await client.post('/bookings', { slotId });
  return data;
}

export async function getBookings(scope = 'upcoming') {
  const { data } = await client.get('/bookings', {
    params: { scope, pageSize: 100 },
  });
  return data;
}

export async function getBooking(bookingId) {
  const { data } = await client.get(`/bookings/${bookingId}`);
  return data;
}
