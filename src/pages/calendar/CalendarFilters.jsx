import { Card } from '../../components/ui';

// Ranges for GET /slots fromTime/toTime. Figma shows "16:00–20:00" only; the
// others split the opening hours the same way (DESIGN §5, 11).
export const INTERVALS = [
  { id: 'all', label: 'Toată ziua', fromTime: null, toTime: null },
  { id: 'morning', label: '08:00–12:00', fromTime: '08:00', toTime: '12:00' },
  { id: 'noon', label: '12:00–16:00', fromTime: '12:00', toTime: '16:00' },
  { id: 'evening', label: '16:00–20:00', fromTime: '16:00', toTime: '20:00' },
  // The API takes no 24:00; 23:59 keeps every slot that ends by midnight.
  { id: 'night', label: '20:00–24:00', fromTime: '20:00', toTime: '23:59' },
];

function chipClass(selected) {
  return `rounded-full px-4 py-1.5 text-sm ring-1 ${
    selected
      ? 'bg-principala/10 font-bold text-principala ring-principala'
      : 'bg-suprafata text-text ring-bordura hover:bg-fundal'
  }`;
}

function ChipGroup({ title, options, value, onChange }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={`${chipClass(option.value === value)} text-left`}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

function ChipSelect({ label, options, value, onChange }) {
  const selected = options.find((option) => option.value === value);
  return (
    <label className={`${chipClass(selected !== options[0])} relative`}>
      {selected.label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * "Filtre" of screen 02: a side card with chip lists on desktop, a card with
 * chip-shaped menus on phones (Figma). Sport and interval go to GET /slots.
 * @param {{sports: Array<{id: number, name: string}>, sportId: string,
 *     onSportChange: function(string), intervalId: string,
 *     onIntervalChange: function(string), onReset: function}} props
 *     sportId is '' for every sport
 */
export default function CalendarFilters({
  sports,
  sportId,
  onSportChange,
  intervalId,
  onIntervalChange,
  onReset,
}) {
  const sportOptions = [
    { value: '', label: 'Toate sporturile' },
    ...sports.map((sport) => ({ value: String(sport.id), label: sport.name })),
  ];
  const intervalOptions = INTERVALS.map((interval) => ({
    value: interval.id,
    label: interval.label,
  }));
  const header = (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold">Filtre</h2>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-bold text-principala hover:underline"
      >
        Resetează
      </button>
    </div>
  );

  return (
    <>
      <Card padding="p-4" className="flex flex-col gap-4 md:hidden">
        {header}
        <div className="flex flex-wrap gap-2">
          <ChipSelect
            label="Tip sport"
            options={sportOptions}
            value={sportId}
            onChange={onSportChange}
          />
          <ChipSelect
            label="Interval orar"
            options={intervalOptions}
            value={intervalId}
            onChange={onIntervalChange}
          />
        </div>
      </Card>
      <Card padding="p-5" className="hidden flex-col gap-6 md:flex">
        {header}
        <ChipGroup
          title="Tip sport"
          options={sportOptions}
          value={sportId}
          onChange={onSportChange}
        />
        <ChipGroup
          title="Interval orar"
          options={intervalOptions}
          value={intervalId}
          onChange={onIntervalChange}
        />
      </Card>
    </>
  );
}
