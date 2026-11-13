import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { createBooking, getFacility, getSlots } from '../api/endpoints';
import { errorCode, errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthContext';
import { ArrowLeftIcon } from '../components/icons';
import { Button, Card, ErrorState, LoadingState } from '../components/ui';
import {
  formatDate,
  formatDayLong,
  formatDayNumber,
  formatPrice,
  formatTime,
  formatTimeRange,
  formatWeekdayShort,
  monthlyRemainingText,
  nextDays,
  toIsoDay,
} from '../lib/format';

const DAYS_SHOWN = 7;

function SlotButton({ slot, selected, disabled, onSelect }) {
  let tone = 'bg-suprafata ring-1 ring-text/70 hover:bg-fundal';
  if (selected) {
    tone = 'bg-principala text-white ring-1 ring-principala';
  } else if (disabled) {
    tone = 'bg-gray-100 text-gray-400 line-through ring-1 ring-gray-200';
  }
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={`h-10 rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed ${tone}`}
    >
      {formatTime(slot.startsAt)}
    </button>
  );
}

function BookingPanel({ facility }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [days] = useState(() => nextDays(DAYS_SHOWN));
  const [openedAt] = useState(() => Date.now());
  const [day, setDay] = useState(() => toIsoDay(days[0]));
  const [selectedId, setSelectedId] = useState(null);

  const slots = useQuery({
    queryKey: ['slots', facility.id, day],
    queryFn: () => getSlots(facility.id, day),
  });
  const booking = useMutation({
    mutationFn: createBooking,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate(`/rezervari/${created.id}`);
    },
    onError: (error) => {
      if (errorCode(error) === 'SLOT_TAKEN') {
        setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      }
    },
  });

  const selected = slots.data?.find((slot) => slot.id === selectedId) ?? null;
  const firstSlot = slots.data?.[0];
  const durationMinutes = firstSlot
    ? (new Date(firstSlot.endsAt) - new Date(firstSlot.startsAt)) / 60000
    : null;
  const remaining =
    user.monthlyLimit === null ? null : monthlyRemainingText(user);

  function chooseDay(isoDay) {
    setDay(isoDay);
    setSelectedId(null);
    booking.reset();
  }

  return (
    <Card className="flex flex-col gap-4 md:sticky md:top-6">
      <div>
        <h2 className="text-base font-bold">Rezervă</h2>
        <p className="mt-2 text-[15px] font-bold">
          {formatDayLong(`${day}T12:00:00Z`)}
        </p>
      </div>

      <div
        className="grid grid-cols-7 gap-1.5"
        role="group"
        aria-label="Alege ziua"
      >
        {days.map((date) => {
          const isoDay = toIsoDay(date);
          const active = isoDay === day;
          return (
            <button
              key={isoDay}
              type="button"
              aria-pressed={active}
              onClick={() => chooseDay(isoDay)}
              aria-label={formatDayLong(date)}
              className={`flex flex-col items-center rounded-lg py-1.5 text-xs ${
                active
                  ? 'bg-principala text-white'
                  : 'bg-fundal ring-1 ring-bordura hover:bg-gray-100'
              }`}
            >
              <span>{formatWeekdayShort(date)}</span>
              <span className="text-base font-bold">
                {formatDayNumber(date)}
              </span>
            </button>
          );
        })}
      </div>

      {durationMinutes !== null && (
        <p className="text-sm text-text-secundar">
          Durată: {durationMinutes} minute
        </p>
      )}

      {slots.isPending && <LoadingState text="Se încarcă intervalele…" />}
      {slots.isError && (
        <ErrorState
          text={errorMessage(slots.error)}
          onRetry={() => slots.refetch()}
        />
      )}
      {slots.data?.length === 0 && (
        <p className="text-sm text-text-secundar">
          Nu sunt intervale în această zi.
        </p>
      )}
      {slots.data && slots.data.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.data.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              selected={slot.id === selectedId}
              disabled={
                slot.availability !== 'free' ||
                new Date(slot.startsAt).getTime() <= openedAt
              }
              onSelect={() => {
                setSelectedId(slot.id);
                booking.reset();
              }}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="border-t border-bordura pt-4 text-sm">
          <p>{facility.name}</p>
          <p>
            {facility.sport.name} · {facility.capacity} jucători
          </p>
          <p>
            {formatDate(selected.startsAt)} ·{' '}
            {formatTimeRange(selected.startsAt, selected.endsAt)}
          </p>
          <p className="mt-3 flex items-baseline justify-between">
            <span className="text-base font-bold">Total</span>
            <span className="text-[24px] font-bold text-principala">
              {formatPrice(selected.price)}
            </span>
          </p>
        </div>
      )}

      {remaining && <p className="text-xs text-text-secundar">{remaining}</p>}

      {booking.isError && <ErrorState text={errorMessage(booking.error)} />}

      <Button
        disabled={!selected || booking.isPending}
        onClick={() => booking.mutate(selected.id)}
        className="w-full"
      >
        {booking.isPending ? 'Se rezervă…' : 'Confirmă rezervarea'}
      </Button>
    </Card>
  );
}

export default function FacilityPage() {
  const { facilityId } = useParams();
  const facility = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => getFacility(facilityId),
  });

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 self-start text-sm hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Înapoi
      </Link>
      <h1 className="text-[24px] font-bold md:text-[32px]">
        Detalii facilitate
      </h1>

      {facility.isPending && <LoadingState />}
      {facility.isError && (
        <ErrorState
          text={errorMessage(facility.error)}
          onRetry={() => facility.refetch()}
        />
      )}
      {facility.data && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_380px] md:items-start">
          <div className="flex flex-col gap-4">
            {facility.data.images[0] && (
              <img
                src={facility.data.images[0].url}
                alt={facility.data.name}
                className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-bordura"
              />
            )}
            {facility.data.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {facility.data.images.slice(1).map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt=""
                    className="aspect-[16/9] w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            <div>
              <h2 className="text-[24px] font-bold">{facility.data.name}</h2>
              <p className="text-sm text-text-secundar">
                Sport: {facility.data.sport.name} · Capacitate:{' '}
                {facility.data.capacity} jucători
              </p>
              <p className="mt-2 text-[16px] font-bold text-principala">
                {facility.data.pricePerHour === 0
                  ? 'Gratuit'
                  : `${facility.data.pricePerHour} lei / oră`}
              </p>
            </div>
            {facility.data.description && (
              <p className="text-[15px]">{facility.data.description}</p>
            )}
            <dl className="grid gap-1 text-sm text-text-secundar">
              {facility.data.location && (
                <div>
                  <dt className="inline">Locație: </dt>
                  <dd className="inline text-text">{facility.data.location}</dd>
                </div>
              )}
              {facility.data.opensAt && (
                <div>
                  <dt className="inline">Program: </dt>
                  <dd className="inline text-text">
                    {facility.data.opensAt}–{facility.data.closesAt}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <BookingPanel facility={facility.data} />
        </div>
      )}
    </div>
  );
}
