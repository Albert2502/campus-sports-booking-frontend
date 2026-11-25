import { useWatch } from 'react-hook-form';

import { AMENITIES, STATUS_LABELS } from '../../lib/facilities';

/** Toggle chips for the amenities field of the facility form. */
export function AmenityChips({ form }) {
  const { control, setValue } = form;
  const selected = useWatch({ control, name: 'amenities' });

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    setValue('amenities', next, { shouldDirty: true });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {AMENITIES.map(({ value, label }) => {
        const on = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(value)}
            className={`rounded-full px-4 py-2 text-[15px] font-bold ring-1 ${
              on
                ? 'bg-[#eaf0ff] text-principala ring-principala'
                : 'bg-suprafata text-text ring-bordura'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const STATUS_ORDER = ['active', 'maintenance', 'inactive'];

/** Segmented radio group for the status field of the facility form. */
export function StatusSegments({ form }) {
  const { control, setValue } = form;
  const status = useWatch({ control, name: 'status' });

  function choose(value) {
    setValue('status', value, { shouldDirty: true });
  }

  function onKeyDown(event) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];
    if (!step) {
      return;
    }
    event.preventDefault();
    const index = STATUS_ORDER.indexOf(status);
    const next =
      STATUS_ORDER[(index + step + STATUS_ORDER.length) % STATUS_ORDER.length];
    choose(next);
    event.currentTarget.querySelector(`[data-value="${next}"]`)?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Stare"
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 gap-1 rounded-xl bg-fundal p-1"
    >
      {STATUS_ORDER.map((value) => {
        const on = status === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            data-value={value}
            tabIndex={on ? 0 : -1}
            onClick={() => choose(value)}
            className={`h-[34px] rounded-lg text-sm ${
              on
                ? 'bg-suprafata font-bold text-principala shadow-sm'
                : 'text-text-secundar'
            }`}
          >
            {STATUS_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}
