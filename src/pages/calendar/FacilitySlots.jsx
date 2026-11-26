import { useState } from 'react';

import { Card } from '../../components/ui';
import { formatTime } from '../../lib/dates';

// Phones show this many slots, then "+N intervale" (Figma).
const PHONE_VISIBLE = 4;

const STATE_LABELS = {
  free: 'liber',
  occupied: 'ocupat',
  closed: 'închis',
};

const SLOT_BASE =
  'h-10 w-[72px] rounded-lg text-sm font-bold transition-colors md:w-24';

function slotClass(slot, selected) {
  if (selected) {
    return `${SLOT_BASE} bg-principala text-white`;
  }
  if (slot.availability === 'free') {
    return `${SLOT_BASE} bg-suprafata text-text ring-1 ring-bordura hover:bg-fundal`;
  }
  return `${SLOT_BASE} cursor-not-allowed bg-gray-100 text-text-secundar`;
}

/** "Liber", "Selectat", "Ocupat / închis", as the slot buttons look. */
export function SlotLegend() {
  const item = (className, text) => (
    <span
      className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm ${className}`}
    >
      {text}
    </span>
  );
  return (
    <div className="flex gap-2" aria-hidden="true">
      {item('bg-suprafata ring-1 ring-bordura', 'Liber')}
      {item('bg-principala font-bold text-white', 'Selectat')}
      {item('bg-gray-100 text-text-secundar', 'Ocupat / închis')}
    </div>
  );
}

/**
 * One facility and its slots for the day. Only free slots can be chosen.
 * @param {{group: {facilityName: string, sportName: string,
 *     slots: Array<Object>}, capacity: ?number, selectedId: ?number,
 *     onSelect: function(Object)}} props
 */
export default function FacilitySlots({
  group,
  capacity,
  selectedId,
  onSelect,
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = expanded ? 0 : group.slots.length - PHONE_VISIBLE;

  return (
    <Card padding="p-4 md:p-5" className="md:flex md:items-start md:gap-6">
      <div className="md:w-44 md:shrink-0 md:pt-1">
        <h3 className="text-lg font-bold">{group.facilityName}</h3>
        <p className="text-sm text-text-secundar">
          {group.sportName}
          {capacity ? ` · ${capacity} jucători` : ''}
        </p>
      </div>
      {/* Desktop rows always show every slot; only phones collapse them. */}
      <ul className="mt-4 flex flex-wrap gap-2 md:mt-0 md:flex-1">
        {group.slots.map((slot, index) => {
          const selected = slot.id === selectedId;
          const time = formatTime(slot.startsAt);
          return (
            <li
              key={slot.id}
              className={
                !expanded && index >= PHONE_VISIBLE ? 'hidden md:block' : ''
              }
            >
              <button
                type="button"
                aria-label={`${time}, ${selected ? 'selectat' : STATE_LABELS[slot.availability]}`}
                aria-pressed={selected}
                disabled={slot.availability !== 'free'}
                onClick={() => onSelect(slot)}
                className={slotClass(slot, selected)}
              >
                {time}
              </button>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 text-sm font-bold text-principala hover:underline md:hidden"
        >
          +{hidden} intervale
        </button>
      )}
    </Card>
  );
}
