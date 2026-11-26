import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ro } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

import { getFreeSlotsBetween } from '../../api/slots';
import { Button } from '../../components/ui';
import {
  dayOf,
  formatLongDay,
  fromPickerDate,
  toPickerDate,
} from '../../lib/dates';
import '../../styles/day-picker.css';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MONTHS_AHEAD = 12;
const WEEKDAYS = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

/**
 * The days of `month` that still have free slots, for the dots (Figma).
 * Romania's midnight is 21:00 or 22:00 UTC, so the request starts 3 hours
 * before the 1st (UTC) and lasts the API's maximum of 31 days; slots are then
 * sorted into days by their Romanian date.
 * @param {Date} month first day of the month
 * @return {Promise<Array<string>>} YYYY-MM-DD
 */
async function freeDaysOf(month) {
  const from = new Date(
    Date.UTC(month.getFullYear(), month.getMonth(), 1) - 3 * HOUR_MS,
  );
  const slots = await getFreeSlotsBetween(
    from,
    new Date(from.getTime() + 31 * DAY_MS),
  );
  return [...new Set(slots.map((slot) => dayOf(slot.startsAt)))];
}

/**
 * Panel 02a "Alege data": a bottom sheet on phones and a small dialog on
 * desktop (Figma). Mounted only while open; closes with ×, Escape, a click
 * outside it or "Alege data", which reports the chosen day.
 * @param {{value: string, firstDay: string, onChoose: function(string),
 *     onClose: function}} props days as YYYY-MM-DD; days before `firstDay`
 *     cannot be chosen
 */
export default function DatePickerPanel({
  value,
  firstDay,
  onChoose,
  onClose,
}) {
  const [pending, setPending] = useState(value);
  const [month, setMonth] = useState(() => monthStart(toPickerDate(value)));
  const dialog = useRef(null);

  const freeDays = useQuery({
    queryKey: ['free-days', fromPickerDate(month)],
    queryFn: () => freeDaysOf(month),
  });

  useEffect(() => {
    dialog.current.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const first = toPickerDate(firstDay);
  const last = new Date(
    first.getFullYear(),
    first.getMonth() + MONTHS_AHEAD,
    1,
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 md:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alege-data-title"
        tabIndex={-1}
        className="alege-data flex w-full flex-col gap-4 rounded-t-3xl bg-suprafata px-5 pt-3 pb-8 outline-none md:w-[360px] md:rounded-2xl md:p-6"
      >
        <span
          className="mx-auto h-1.5 w-10 rounded-full bg-gray-300 md:hidden"
          aria-hidden="true"
        />
        <header className="flex items-center justify-between">
          <h2 id="alege-data-title" className="text-xl font-bold">
            Alege data
          </h2>
          <button
            type="button"
            aria-label="Închide"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-2xl text-text-secundar ring-1 ring-bordura hover:bg-fundal"
          >
            ×
          </button>
        </header>
        <DayPicker
          mode="single"
          required
          locale={ro}
          weekStartsOn={1}
          captionLayout="dropdown"
          navLayout="around"
          showOutsideDays
          month={month}
          onMonthChange={setMonth}
          startMonth={monthStart(first)}
          endMonth={last}
          selected={toPickerDate(pending)}
          onSelect={(date) => setPending(fromPickerDate(date))}
          disabled={{ before: first }}
          modifiers={{ hasFree: (freeDays.data ?? []).map(toPickerDate) }}
          modifiersClassNames={{ hasFree: 'rdp-has-free' }}
          formatters={{
            formatWeekdayName: (date) => WEEKDAYS[date.getDay()],
            formatMonthDropdown: (date) =>
              capitalize(date.toLocaleDateString('ro-RO', { month: 'long' })),
          }}
        />
        <div className="rounded-xl bg-fundal px-4 py-3">
          <p className="text-xs text-text-secundar">Data selectată</p>
          <p className="text-sm font-bold">{formatLongDay(pending)}</p>
        </div>
        <Button className="w-full" onClick={() => onChoose(pending)}>
          Alege data
        </Button>
      </div>
    </div>
  );
}
