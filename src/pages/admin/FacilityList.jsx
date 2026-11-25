import { FieldIcon } from '../../components/icons';
import { formatPrice, programText, STATUS_LABELS } from '../../lib/facilities';
import { adminButton } from './adminStyles';

const BADGE_STYLES = {
  active: 'bg-[#e7f6ec] text-[#166534]',
  maintenance: 'bg-[#fff1e0] text-[#9a3412]',
  inactive: 'bg-gray-100 text-gray-600',
};

function StatusBadge({ facility }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${BADGE_STYLES[facility.status]}`}
    >
      {STATUS_LABELS[facility.status]}
    </span>
  );
}

function MaintenanceNote({ facility }) {
  if (facility.status !== 'maintenance' || !facility.maintenanceNote) {
    return null;
  }
  return (
    <p className="mt-1 text-sm text-text-secundar">
      {facility.maintenanceNote}
    </p>
  );
}

function Thumbnail({ facility, className }) {
  const image = facility.images[0];
  if (image) {
    return (
      <img
        src={image.url}
        alt=""
        className={`${className} bg-fundal object-cover`}
      />
    );
  }
  return (
    <span
      className={`${className} flex items-center justify-center bg-fundal text-text-secundar`}
      aria-hidden="true"
    >
      <FieldIcon className="size-6" />
    </span>
  );
}

function toggleLabel(facility) {
  return facility.status === 'inactive' ? 'Reactivează' : 'Dezactivează';
}

function priceLine(facility) {
  const price = formatPrice(facility.pricePerHour);
  return facility.pricePerHour === 0 ? price : `${price} / oră`;
}

const HEADERS = [
  'Imagine',
  'Denumire',
  'Tip',
  'Locație',
  'Preț / oră',
  'Program',
  'Stare',
  'Acțiuni',
];

const LINK_BUTTON = 'font-bold text-principala hover:underline';

function DesktopTable({ facilities, onEdit, onToggle }) {
  return (
    <div className="hidden overflow-hidden rounded-2xl bg-suprafata shadow-sm ring-1 ring-bordura md:block">
      <table className="w-full text-left" aria-label="Facilități">
        <thead className="bg-principala text-sm font-bold text-white">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-4 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {facilities.map((facility) => (
            <tr key={facility.id} className="border-t border-bordura">
              <td className="px-4 py-4">
                <Thumbnail
                  facility={facility}
                  className="h-[52px] w-16 rounded-lg"
                />
              </td>
              <td className="px-4 py-4 text-base font-bold">{facility.name}</td>
              <td className="px-4 py-4">{facility.sport.name}</td>
              <td className="px-4 py-4">{facility.location ?? '—'}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                {formatPrice(facility.pricePerHour)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {programText(facility.hours)}
              </td>
              <td className="px-4 py-4">
                <StatusBadge facility={facility} />
                <MaintenanceNote facility={facility} />
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={LINK_BUTTON}
                    onClick={() => onEdit(facility)}
                  >
                    Editează
                  </button>
                  <button
                    type="button"
                    className={LINK_BUTTON}
                    onClick={() => onToggle(facility)}
                  >
                    {toggleLabel(facility)}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhoneCards({ facilities, onEdit, onToggle }) {
  const small = `${adminButton.outline} flex-1`;
  return (
    <ul
      className="flex flex-col gap-4 md:hidden"
      aria-label="Facilități (listă pe telefon)"
    >
      {facilities.map((facility) => (
        <li
          key={facility.id}
          className="rounded-2xl bg-suprafata p-6 shadow-sm ring-1 ring-bordura"
        >
          <Thumbnail
            facility={facility}
            className="h-[120px] w-full rounded-xl"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{facility.name}</h2>
            <StatusBadge facility={facility} />
          </div>
          <MaintenanceNote facility={facility} />
          <p className="mt-2 text-text-secundar">
            {[facility.sport.name, facility.location]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1">
            {priceLine(facility)} · {programText(facility.hours)}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className={small}
              onClick={() => onEdit(facility)}
            >
              Editează
            </button>
            <button
              type="button"
              className={small}
              onClick={() => onToggle(facility)}
            >
              {toggleLabel(facility)}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The facilities as a table (md and up) and as cards (phones).
 * @param {{facilities: Array<Object>, onEdit: function, onToggle: function}} props
 */
export default function FacilityList(props) {
  return (
    <>
      <DesktopTable {...props} />
      <PhoneCards {...props} />
    </>
  );
}
