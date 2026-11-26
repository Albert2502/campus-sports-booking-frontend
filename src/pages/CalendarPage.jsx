import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage } from '../api/errors';
import { getSlots } from '../api/slots';
import { getSports } from '../api/sports';
import { ErrorState, LoadingState } from '../components/ui';
import { addDays, formatDayRange, formatTime, today } from '../lib/dates';
import CalendarFilters, { INTERVALS } from './calendar/CalendarFilters';
import DayStrip from './calendar/DayStrip';

const STRIP_DAYS = 7;

/**
 * The day's slots grouped by facility, in the API's order.
 * @param {Array<Object>} slots
 * @return {Array<{facilityId: number, facilityName: string,
 *     sportName: string, slots: Array<Object>}>}
 */
function byFacility(slots) {
  const groups = new Map();
  for (const slot of slots) {
    if (!groups.has(slot.facilityId)) {
      groups.set(slot.facilityId, {
        facilityId: slot.facilityId,
        facilityName: slot.facilityName,
        sportName: slot.sportName,
        slots: [],
      });
    }
    groups.get(slot.facilityId).slots.push(slot);
  }
  return [...groups.values()];
}

/** Screen 02 Calendar și filtre (Figma "02 Acasă"), data from GET /slots. */
export default function CalendarPage() {
  // A rolling week from today, so no day in the strip is in the past.
  const [stripStart] = useState(today);
  const [day, setDay] = useState(stripStart);
  const [sportId, setSportId] = useState('');
  const [intervalId, setIntervalId] = useState('all');

  const interval = INTERVALS.find((item) => item.id === intervalId);
  const days = Array.from({ length: STRIP_DAYS }, (_, index) =>
    addDays(stripStart, index),
  );

  const sports = useQuery({ queryKey: ['sports'], queryFn: getSports });
  const slots = useQuery({
    queryKey: ['slots', day, sportId, intervalId],
    queryFn: () =>
      getSlots({
        date: day,
        sportId: sportId ? Number(sportId) : null,
        fromTime: interval.fromTime,
        toTime: interval.toTime,
      }),
  });

  function resetFilters() {
    setSportId('');
    setIntervalId('all');
  }

  function renderSlots() {
    if (slots.isPending) {
      return <LoadingState />;
    }
    if (slots.isError) {
      return (
        <ErrorState
          text={errorMessage(slots.error)}
          onRetry={() => slots.refetch()}
        />
      );
    }
    return (
      <ul className="flex flex-col gap-3">
        {byFacility(slots.data).map((group) => (
          <li key={group.facilityId}>
            {group.facilityName}:{' '}
            {group.slots.map((slot) => formatTime(slot.startsAt)).join(', ')}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-bold md:text-[32px]">
        Calendar și filtre
      </h1>
      <CalendarFilters
        sports={sports.data ?? []}
        sportId={sportId}
        onSportChange={setSportId}
        intervalId={intervalId}
        onIntervalChange={setIntervalId}
        onReset={resetFilters}
      />
      <section className="flex flex-col gap-4" aria-label="Intervale">
        <h2 className="text-base font-bold">
          {formatDayRange(days[0], days[STRIP_DAYS - 1])}
        </h2>
        <DayStrip days={days} selected={day} onSelect={setDay} />
        {renderSlots()}
      </section>
    </div>
  );
}
