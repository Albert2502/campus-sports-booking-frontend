// Dates are shown in the university's time zone, whatever the device's zone.
const TIME_ZONE = 'Europe/Bucharest';

const dateFull = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** E.g. "20 mai 2027". */
export function formatDate(value) {
  return dateFull.format(new Date(value));
}

/**
 * Up to two initials for the avatar, e.g. "Ana Popescu" -> "AP".
 * @param {string} fullName
 * @return {string}
 */
export function initials(fullName) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * The first name, skipping titles such as "Prof." ("Prof. Radu Stan" ->
 * "Radu").
 * @param {string} fullName
 * @return {string}
 */
export function firstName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  return parts.find((part) => !part.endsWith('.')) ?? parts[0];
}

/**
 * This month's remaining bookings, from the numbers the server sends
 * (`bookingsThisMonth`, `monthlyLimit`); the UI never decides the limit.
 * @param {{bookingsThisMonth: number, monthlyLimit: ?number}} user
 * @return {string}
 */
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

/**
 * The same numbers as a counter for the profile card ("1 din 1", Figma 09).
 * @param {{bookingsThisMonth: number, monthlyLimit: ?number}} user
 * @return {string}
 */
export function monthlyRemainingCounter(user) {
  if (user.monthlyLimit === null) {
    return `Rezervări luna aceasta: ${user.bookingsThisMonth} (fără limită)`;
  }
  const remaining = Math.max(user.monthlyLimit - user.bookingsThisMonth, 0);
  return `Rezervări rămase luna aceasta: ${remaining} din ${user.monthlyLimit}`;
}
