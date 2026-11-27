export const STATUS_LABELS = {
  active: 'Activă',
  maintenance: 'În mentenanță',
  inactive: 'Inactivă',
};

export const AMENITIES = [
  { value: 'vestiare', label: 'Vestiare' },
  { value: 'nocturna', label: 'Nocturnă' },
  { value: 'dus', label: 'Duș' },
  { value: 'echipament', label: 'Echipament inclus' },
  { value: 'parcare', label: 'Parcare' },
];

/**
 * Lower-cases and strips diacritics (ș/ț with comma below decompose too).
 * @param {?string} text
 * @return {string}
 */
export function normalizeText(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * The "Program" text of a facility (DESIGN §5, 9).
 * @param {?Array<{closed: boolean, opensAt: ?string, closesAt: ?string}>} hours
 * @return {string}
 */
export function programText(hours) {
  if (!hours) {
    return 'Fără restricție';
  }
  const open = hours.filter((day) => !day.closed);
  if (open.length === 0) {
    return 'Închis';
  }
  const [first] = open;
  const same = open.every(
    (day) => day.opensAt === first.opensAt && day.closesAt === first.closesAt,
  );
  return same ? `${first.opensAt}–${first.closesAt}` : 'Program variabil';
}

const INTEGER_FORMAT = new Intl.NumberFormat('ro-RO', {
  maximumFractionDigits: 0,
});
const DECIMAL_FORMAT = new Intl.NumberFormat('ro-RO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * "120 lei", "12,50 lei" or "Gratuit".
 * @param {number} price per hour
 * @return {string}
 */
export function formatPrice(price) {
  if (price === 0) {
    return 'Gratuit';
  }
  const format = Number.isInteger(price) ? INTEGER_FORMAT : DECIMAL_FORMAT;
  return `${format.format(price)} lei`;
}
