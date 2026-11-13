// Dates are shown in the university's time zone, whatever the device's zone.
const TIME_ZONE = 'Europe/Bucharest';

const dayLong = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const weekdayShort = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  weekday: 'short',
});
const dayNumber = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  day: 'numeric',
});
const dateFull = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const time = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const isoDay = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDayLong(value) {
  return capitalize(dayLong.format(new Date(value)));
}

export function formatWeekdayShort(value) {
  return capitalize(weekdayShort.format(new Date(value)));
}

export function formatDayNumber(value) {
  return dayNumber.format(new Date(value));
}

export function formatDate(value) {
  return dateFull.format(new Date(value));
}

export function formatTime(value) {
  return time.format(new Date(value));
}

export function formatTimeRange(startsAt, endsAt) {
  return `${formatTime(startsAt)}–${formatTime(endsAt)}`;
}

/** YYYY-MM-DD of a moment, in the university's time zone. */
export function toIsoDay(value) {
  return isoDay.format(new Date(value));
}

/** The next `count` days, starting today, as noon moments. */
export function nextDays(count) {
  const today = toIsoDay(Date.now());
  const noon = new Date(`${today}T12:00:00Z`);
  return Array.from(
    { length: count },
    (_, index) => new Date(noon.getTime() + index * 24 * 60 * 60 * 1000),
  );
}

export function formatPrice(amount) {
  return amount === 0 ? 'Gratuit' : `${amount} lei`;
}

/** This month's remaining bookings, as the server reports them. */
export function monthlyRemainingText(user) {
  if (user.monthlyLimit === null) {
    return 'Nu ai o limită lunară de rezervări.';
  }
  const remaining = Math.max(user.monthlyLimit - user.bookingsThisMonth, 0);
  if (remaining === 0) {
    return 'Ai folosit toate rezervările din luna aceasta.';
  }
  return remaining === 1
    ? 'Ți-a rămas 1 rezervare luna aceasta.'
    : `Ți-au rămas ${remaining} rezervări luna aceasta.`;
}

export function initials(fullName) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function firstName(fullName) {
  return fullName.split(/\s+/)[0];
}

export const BOOKING_STATUS_LABELS = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  checked_in: 'Check-in efectuat',
  cancelled: 'Anulată',
  released: 'Eliberată',
  no_show: 'Neprezentare',
};
