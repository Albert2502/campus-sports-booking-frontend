import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage } from '../api/errors';
import { getFacilities } from '../api/facilities';
import { getSlots } from '../api/slots';
import { getSports } from '../api/sports';
import { Button, Card, ErrorState, LoadingState } from '../components/ui';
import { addDays, formatDayRange, formatLongDay, today } from '../lib/dates';
import CalendarFilters, { INTERVALS } from './calendar/CalendarFilters';
import DayStrip from './calendar/DayStrip';
import FacilitySlots, { SlotLegend } from './calendar/FacilitySlots';
import SelectionBar from './calendar/SelectionBar';

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

/** "5 intervale libere", "1 interval liber", "Niciun interval liber". */
function freeText(slots) {
  const free = slots.filter((slot) => slot.availability === 'free').length;
  if (free === 0) {
    return 'Niciun interval liber';
  }
  return free === 1 ? '1 interval liber' : `${free} intervale libere`;
}

/** Screen 02 Calendar și filtre (Figma "02 Acasă"), data from GET /slots. */
export default function CalendarPage() {
  // A rolling week from today, so no day in the strip is in the past.
  const [stripStart] = useState(today);
  const [day, setDay] = useState(stripStart);
  const [sportId, setSportId] = useState('');
  const [intervalId, setIntervalId] = useState('all');
  const [selected, setSelected] = useState(null);

  const interval = INTERVALS.find((item) => item.id === intervalId);
  const days = Array.from({ length: STRIP_DAYS }, (_, index) =>
    addDays(stripStart, index),
  );
  const filtered = sportId !== '' || intervalId !== 'all';

  const sports = useQuery({ queryKey: ['sports'], queryFn: getSports });
  // Shared with screen 00; gives the capacity and the price per hour.
  const facilities = useQuery({
    queryKey: ['facilities', 'active'],
    queryFn: getFacilities,
  });
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
  const facilityById = new Map(
    (facilities.data ?? []).map((facility) => [facility.id, facility]),
  );

  // Another day or filter shows other slots, so the choice is dropped.
  function choose(setter) {
    return (value) => {
      setter(value);
      setSelected(null);
    };
  }

  function resetFilters() {
    setSportId('');
    setIntervalId('all');
    setSelected(null);
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
    if (slots.data.length === 0) {
      return (
        <Card padding="p-8" className="text-center">
          <p className="text-text-secundar">
            Nu există intervale pentru ziua aleasă.
          </p>
          {filtered && (
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Șterge filtrele
            </Button>
          )}
        </Card>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {byFacility(slots.data).map((group) => (
          <FacilitySlots
            key={group.facilityId}
            group={group}
            capacity={facilityById.get(group.facilityId)?.capacity ?? null}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 md:grid md:grid-cols-[240px_1fr] md:items-start md:gap-8 ${
        selected ? 'pb-20 md:pb-0' : ''
      }`}
    >
      <h1 className="text-[28px] font-bold md:col-span-2 md:text-[32px]">
        Calendar și filtre
      </h1>
      <CalendarFilters
        sports={sports.data ?? []}
        sportId={sportId}
        onSportChange={choose(setSportId)}
        intervalId={intervalId}
        onIntervalChange={choose(setIntervalId)}
        onReset={resetFilters}
      />
      <section className="flex flex-col gap-4" aria-label="Intervale">
        <h2 className="text-base font-bold md:hidden">
          {formatDayRange(days[0], days[STRIP_DAYS - 1])}
        </h2>
        <h2 className="hidden text-lg font-bold md:block">
          {formatLongDay(day)}
        </h2>
        <DayStrip days={days} selected={day} onSelect={choose(setDay)} />
        <SlotLegend />
        {renderSlots()}
        {slots.isSuccess && slots.data.length > 0 && (
          <p className="text-sm text-text-secundar">
            {freeText(slots.data)} · {interval.label}
          </p>
        )}
        {selected && (
          <SelectionBar
            slot={selected}
            pricePerHour={
              facilityById.get(selected.facilityId)?.pricePerHour ?? null
            }
          />
        )}
        <Card padding="p-5" className="hidden md:block">
          <h2 className="text-lg font-bold text-principala">
            Mișcare în campus, în ritmul tău
          </h2>
          <p className="mt-1 text-sm text-text-secundar">
            Descoperă facilitățile sportive și rezervă-ți următorul antrenament.
          </p>
        </Card>
      </section>
    </div>
  );
}
