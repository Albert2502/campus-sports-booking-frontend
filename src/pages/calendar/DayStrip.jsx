import { dayLabel, formatLongDay } from '../../lib/dates';

/**
 * The 7-day strip of screen 02: circles on phones, pills on desktop (Figma).
 * @param {{days: Array<string>, selected: string,
 *     onSelect: function(string)}} props days as YYYY-MM-DD
 */
export default function DayStrip({ days, selected, onSelect }) {
  return (
    <div
      className="flex justify-between gap-1 md:gap-3"
      role="group"
      aria-label="Ziua"
    >
      {days.map((day) => {
        const { weekday, dayOfMonth } = dayLabel(day);
        const isSelected = day === selected;
        return (
          <button
            key={day}
            type="button"
            aria-label={formatLongDay(day)}
            aria-pressed={isSelected}
            onClick={() => onSelect(day)}
            className={`flex size-11 flex-col items-center justify-center rounded-full text-xs leading-tight md:h-10 md:w-auto md:flex-1 md:flex-row md:gap-1 md:text-sm ${
              isSelected
                ? 'bg-principala font-bold text-white'
                : 'bg-suprafata text-text ring-1 ring-bordura hover:bg-fundal'
            }`}
          >
            <span>{weekday}</span>
            <span>{dayOfMonth}</span>
          </button>
        );
      })}
    </div>
  );
}
