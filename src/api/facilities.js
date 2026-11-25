import client from './client';

/**
 * GET /facilities: the active facilities, sorted by name.
 * @return {Promise<Array<Object>>}
 */
export async function getFacilities() {
  const { data } = await client.get('/facilities');
  return data;
}

/**
 * GET /facilities?status=all (admin): every facility, whatever its status.
 * @return {Promise<Array<Object>>}
 */
export async function getAdminFacilities() {
  const { data } = await client.get('/facilities', {
    params: { status: 'all' },
  });
  return data;
}

/**
 * POST /facilities (admin).
 * @param {Object} body FacilityInput; sportId, name and capacity are required
 * @return {Promise<Object>} the created facility
 */
export async function createFacility(body) {
  const { data } = await client.post('/facilities', body);
  return data;
}

/**
 * PATCH /facilities/{id} (admin): any subset of the FacilityInput fields.
 * @param {number} id
 * @param {Object} body
 * @return {Promise<Object>} the updated facility
 */
export async function updateFacility(id, body) {
  const { data } = await client.patch(`/facilities/${id}`, body);
  return data;
}

/**
 * POST /facilities/{facilityId}/images (admin): uploads one image.
 * @param {number} facilityId
 * @param {File} file JPG or PNG; the server checks type, size and the limit
 * @return {Promise<{id: number, url: string, position: number}>}
 */
export async function uploadFacilityImage(facilityId, file) {
  const body = new FormData();
  body.append('image', file);
  // No Content-Type header: axios lets the browser add the multipart boundary.
  const { data } = await client.post(`/facilities/${facilityId}/images`, body);
  return data;
}

/**
 * DELETE /facilities/{facilityId}/images/{imageId} (admin).
 * @param {number} facilityId
 * @param {number} imageId
 * @return {Promise<void>}
 */
export async function deleteFacilityImage(facilityId, imageId) {
  await client.delete(`/facilities/${facilityId}/images/${imageId}`);
}
