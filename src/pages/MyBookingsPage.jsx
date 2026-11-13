import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { getBookings } from '../api/endpoints';
import { errorMessage } from '../api/errors';
import BookingScopeTabs from '../components/BookingScopeTabs';
import {
  ButtonLink,
  Card,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '../components/ui';
import {
  BOOKING_STATUS_LABELS,
  formatDayLong,
  formatTimeRange,
} from '../lib/format';

const SCOPES = [
  { value: 'upcoming', label: 'Viitoare' },
  { value: 'past', label: 'Istoric' },
];

export default function MyBookingsPage() {
  const [scope, setScope] = useState('upcoming');
  const bookings = useQuery({
    queryKey: ['bookings', 'mine', scope],
    queryFn: () => getBookings(scope),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-bold md:text-[32px]">Rezervările mele</h1>
      <BookingScopeTabs value={scope} onChange={setScope} options={SCOPES} />

      {bookings.isPending && <LoadingState />}
      {bookings.isError && (
        <ErrorState
          text={errorMessage(bookings.error)}
          onRetry={() => bookings.refetch()}
        />
      )}
      {bookings.data?.items.length === 0 && (
        <Card className="flex flex-col items-start gap-3">
          <p>
            {scope === 'upcoming'
              ? 'Nu ai rezervări viitoare.'
              : 'Nu ai rezervări în istoric.'}
          </p>
          {scope === 'upcoming' && (
            <ButtonLink to="/">Închiriază un teren</ButtonLink>
          )}
        </Card>
      )}
      {bookings.data && bookings.data.items.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {bookings.data.items.map((booking) => (
            <li key={booking.id}>
              <Link
                to={`/rezervari/${booking.id}`}
                className="block rounded-2xl bg-suprafata p-4 shadow-sm ring-1 ring-bordura hover:ring-principala"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{booking.slot.facilityName}</p>
                  <StatusBadge
                    status={booking.status}
                    label={BOOKING_STATUS_LABELS[booking.status]}
                  />
                </div>
                <p className="mt-1 text-sm text-text-secundar">
                  {formatDayLong(booking.slot.startsAt)} ·{' '}
                  {formatTimeRange(booking.slot.startsAt, booking.slot.endsAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
