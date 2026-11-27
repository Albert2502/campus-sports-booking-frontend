export const ADMIN = {
  id: 1,
  fullName: 'Admin Campus',
  email: 'admin@campus.test',
  role: 'admin',
  status: 'active',
  blockedUntil: null,
  bookingsThisMonth: 0,
  monthlyLimit: null,
  noShowCount: 0,
};
export const SPORTS = [
  { id: 1, name: 'Baschet' },
  { id: 2, name: 'Tenis' },
];

export function week(overrides = {}) {
  return Array.from({ length: 7 }, (_, index) => ({
    weekday: index + 1,
    closed: false,
    opensAt: '08:00',
    closesAt: '22:00',
    ...overrides[index],
  }));
}

export function facility(overrides = {}) {
  return {
    id: 10,
    sport: SPORTS[0],
    name: 'Sală de baschet',
    location: 'Corp A',
    capacity: 20,
    description: null,
    pricePerHour: 120,
    hours: week(),
    minBookingMinutes: 60,
    amenities: ['dus'],
    status: 'active',
    maintenanceNote: null,
    images: [],
    ...overrides,
  };
}

export const COURT = facility({
  id: 11,
  sport: SPORTS[1],
  name: 'Teren de tenis',
  location: 'Parc sportiv',
  pricePerHour: 12.5,
  hours: null,
  status: 'maintenance',
  maintenanceNote: 'Refacere zgură',
});
export const OLD_HALL = facility({
  id: 12,
  name: 'Sală veche',
  location: null,
  pricePerHour: 0,
  hours: week({ 0: { opensAt: '10:00' } }),
  status: 'inactive',
});
