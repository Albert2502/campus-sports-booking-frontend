// Days are YYYY-MM-DD strings in the university's time zone, whatever the
// device's zone, the same days GET /slots?date= uses.
const TIME_ZONE = 'Europe/Bucharest';
const DAY_MS = 24 * 60 * 60 * 1000;

const SHORT_DAYS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const LONG_DAYS = [
  'Luni',
  'Marți',
  'Miercuri',
  'Joi',
  'Vineri',
  'Sâmbătă',
  'Duminică',
];

const isoDay = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });
const dayMonth = new Intl.DateTimeFormat('ro-RO', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
});
const dayMonthYear = new Intl.DateTimeFormat('ro-RO', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const hourMinute = new Intl.DateTimeFormat('ro-RO', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Noon UTC keeps the calendar day whatever is added or formatted.
const toDate = (day) => new Date(`${day}T12:00:00Z`);

/**
 * Today in Romania, e.g. "2026-11-26".
 * @param {Date=} now
 * @return {string}
 */
export function today(now = new Date()) {
  return isoDay.format(now);
}

/**
 * The Romanian day of a moment, e.g. a slot's `startsAt`.
 * @param {string|Date} dateTime
 * @return {string} YYYY-MM-DD
 */
export function dayOf(dateTime) {
  return isoDay.format(new Date(dateTime));
}

/**
 * @param {string} day YYYY-MM-DD
 * @param {number} count may be negative
 * @return {string} YYYY-MM-DD
 */
export function addDays(day, count) {
  return new Date(toDate(day).getTime() + count * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * 0 for Monday … 6 for Sunday.
 * @param {string} day YYYY-MM-DD
 * @return {number}
 */
function weekdayIndex(day) {
  return (toDate(day).getUTCDay() + 6) % 7;
}

/**
 * The labels of the day strip: "Joi" and "26".
 * @param {string} day YYYY-MM-DD
 * @return {{weekday: string, dayOfMonth: number}}
 */
export function dayLabel(day) {
  return {
    weekday: SHORT_DAYS[weekdayIndex(day)],
    dayOfMonth: toDate(day).getUTCDate(),
  };
}

/** E.g. "Joi, 26 noiembrie 2026". */
export function formatLongDay(day) {
  return `${LONG_DAYS[weekdayIndex(day)]}, ${dayMonthYear.format(toDate(day))}`;
}

/**
 * E.g. "26 noiembrie – 2 decembrie 2026", or "1–7 decembrie 2026" within a
 * month.
 * @param {string} first YYYY-MM-DD
 * @param {string} last YYYY-MM-DD
 * @return {string}
 */
export function formatDayRange(first, last) {
  const end = dayMonthYear.format(toDate(last));
  if (first.slice(0, 7) === last.slice(0, 7)) {
    return `${toDate(first).getUTCDate()}–${end}`;
  }
  return `${dayMonth.format(toDate(first))} – ${end}`;
}

/**
 * A day as react-day-picker's Date: local noon of that calendar day, so the
 * device's time zone never moves it to another day.
 * @param {string} day YYYY-MM-DD
 * @return {Date}
 */
export function toPickerDate(day) {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return new Date(year, month - 1, dayOfMonth, 12);
}

/**
 * The calendar day of a react-day-picker Date.
 * @param {Date} date
 * @return {string} YYYY-MM-DD
 */
export function fromPickerDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** E.g. "16:00" for a slot that starts at 16:00 in Romania. */
export function formatTime(dateTime) {
  return hourMinute.format(new Date(dateTime));
}
