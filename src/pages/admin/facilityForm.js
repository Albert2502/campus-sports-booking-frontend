import { z } from 'zod';

export const DAY_NAMES = [
  'Luni',
  'Marți',
  'Miercuri',
  'Joi',
  'Vineri',
  'Sâmbătă',
  'Duminică',
];

export const MIN_BOOKING_OPTIONS = [30, 60, 90, 120];

const DEFAULT_OPENS = '08:00';
const DEFAULT_CLOSES = '22:00';

const PRICE_MESSAGE = 'Prețul este un număr pozitiv, cu cel mult 2 zecimale.';
const CAPACITY_MESSAGE = 'Capacitatea este un număr întreg de cel puțin 1.';

// The server has the last word; these checks repeat its simple rules.
export const facilitySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Introdu denumirea.' })
      .max(120, { error: 'Denumirea are cel mult 120 de caractere.' }),
    sportId: z.string().min(1, { error: 'Alege sportul.' }),
    location: z
      .string()
      .max(200, { error: 'Locația are cel mult 200 de caractere.' }),
    capacity: z
      .string()
      .trim()
      .regex(/^\d+$/, { error: CAPACITY_MESSAGE })
      .refine((value) => Number(value) >= 1, { error: CAPACITY_MESSAGE }),
    description: z
      .string()
      .max(1000, { error: 'Descrierea are cel mult 1000 de caractere.' }),
    pricePerHour: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, { error: PRICE_MESSAGE })
      .refine((value) => Number(value) <= 999999.99, { error: PRICE_MESSAGE }),
    minBookingMinutes: z.string(),
    hoursEnabled: z.boolean(),
    hours: z.array(
      z.object({
        closed: z.boolean(),
        opensAt: z.string(),
        closesAt: z.string(),
      }),
    ),
    amenities: z.array(z.string()),
    status: z.enum(['active', 'maintenance', 'inactive']),
    maintenanceNote: z
      .string()
      .max(200, { error: 'Motivul are cel mult 200 de caractere.' }),
  })
  .superRefine((values, ctx) => {
    if (!values.hoursEnabled) {
      return;
    }
    values.hours.forEach((day, index) => {
      if (day.closed) {
        return;
      }
      const issue = (message) =>
        ctx.addIssue({
          code: 'custom',
          path: ['hours', index, 'closesAt'],
          message,
        });
      if (!day.opensAt || !day.closesAt) {
        issue('Completează ora de deschidere și de închidere.');
      } else if (day.closesAt <= day.opensAt) {
        issue('Ora de închidere este după cea de deschidere.');
      }
    });
  });

function defaultHours() {
  return Array.from({ length: 7 }, () => ({
    closed: false,
    opensAt: DEFAULT_OPENS,
    closesAt: DEFAULT_CLOSES,
  }));
}

/**
 * Form values for a new facility, or for editing `facility`.
 * @param {?Object} facility
 * @return {Object}
 */
export function toFormValues(facility) {
  if (!facility) {
    return {
      name: '',
      sportId: '',
      location: '',
      capacity: '',
      description: '',
      pricePerHour: '0',
      minBookingMinutes: '60',
      hoursEnabled: true,
      hours: defaultHours(),
      amenities: [],
      status: 'active',
      maintenanceNote: '',
    };
  }
  return {
    name: facility.name,
    sportId: String(facility.sport.id),
    location: facility.location ?? '',
    capacity: String(facility.capacity),
    description: facility.description ?? '',
    pricePerHour: String(facility.pricePerHour),
    minBookingMinutes: String(facility.minBookingMinutes),
    hoursEnabled: facility.hours !== null,
    hours: facility.hours
      ? facility.hours.map((day) => ({
          closed: day.closed,
          opensAt: day.opensAt ?? DEFAULT_OPENS,
          closesAt: day.closesAt ?? DEFAULT_CLOSES,
        }))
      : defaultHours(),
    amenities: facility.amenities,
    status: facility.status,
    maintenanceNote: facility.maintenanceNote ?? '',
  };
}

/**
 * The API body for the validated form values. The note is sent only for a
 * facility in maintenance: the server rejects it for other statuses.
 * @param {Object} values
 * @return {Object}
 */
export function toRequestBody(values) {
  const body = {
    sportId: Number(values.sportId),
    name: values.name.trim(),
    location: values.location.trim() || null,
    capacity: Number(values.capacity),
    description: values.description.trim() || null,
    pricePerHour: Number(values.pricePerHour),
    hours: values.hoursEnabled
      ? values.hours.map((day, index) => ({
          weekday: index + 1,
          closed: day.closed,
          opensAt: day.closed ? null : day.opensAt,
          closesAt: day.closed ? null : day.closesAt,
        }))
      : null,
    minBookingMinutes: Number(values.minBookingMinutes),
    amenities: values.amenities,
    status: values.status,
  };
  if (values.status === 'maintenance') {
    body.maintenanceNote = values.maintenanceNote.trim() || null;
  }
  return body;
}

const SIMPLE_FIELDS = new Set([
  'name',
  'sportId',
  'location',
  'capacity',
  'description',
  'pricePerHour',
  'minBookingMinutes',
  'amenities',
  'status',
  'maintenanceNote',
]);

/**
 * Maps a server field path to a form field, or null when the form has no such
 * field.
 * @param {string} path e.g. `name` or `hours.2.opensAt`
 * @return {?string}
 */
export function formFieldFor(path) {
  if (SIMPLE_FIELDS.has(path)) {
    return path;
  }
  const day = /^hours\.(\d)\.(opensAt|closesAt|closed)$/.exec(path);
  if (day) {
    // The row shows one message, kept under closesAt.
    return `hours.${day[1]}.closesAt`;
  }
  return null;
}
