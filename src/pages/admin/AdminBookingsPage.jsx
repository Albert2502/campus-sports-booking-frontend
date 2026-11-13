import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getBookings } from '../../api/endpoints';
import { errorMessage } from '../../api/errors';
import BookingScopeTabs from '../../components/BookingScopeTabs';
import {
  Card,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '../../components/ui';
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  formatTimeRange,
} from '../../lib/format';

const SCOPES = [
  { value: 'upcoming', label: 'Viitoare' },
  { value: 'past', label: 'Istoric' },
  { value: 'all', label: 'Toate' },
];

export default function AdminBookingsPage() {
  const [scope, setScope] = useState('upcoming');
  const bookings = useQuery({
    queryKey: ['bookings', 'admin', scope],
    queryFn: () => getBookings(scope),
  });
  const items = bookings.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold md:text-[32px]">Rezervări</h1>
        <p className="mt-1 text-sm text-text-secundar">
          Toate rezervările făcute de utilizatori.
        </p>
      </div>
      <BookingScopeTabs value={scope} onChange={setScope} options={SCOPES} />

      {bookings.isPending && <LoadingState />}
      {bookings.isError && (
        <ErrorState
          text={errorMessage(bookings.error)}
          onRetry={() => bookings.refetch()}
        />
      )}
      {bookings.data && items.length === 0 && (
        <Card>
          <p>Nu există rezervări în această listă.</p>
        </Card>
      )}

      {items.length > 0 && (
        <>
          <Card padding="p-0" className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-bordura text-text-secundar">
                <tr>
                  <th className="px-5 py-3 font-bold">Nr.</th>
                  <th className="px-5 py-3 font-bold">Facilitate</th>
                  <th className="px-5 py-3 font-bold">Data</th>
                  <th className="px-5 py-3 font-bold">Interval</th>
                  <th className="px-5 py-3 font-bold">Utilizator</th>
                  <th className="px-5 py-3 font-bold">Stare</th>
                </tr>
              </thead>
              <tbody>
                {items.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-bordura last:border-0"
                  >
                    <td className="px-5 py-3">#{booking.id}</td>
                    <td className="px-5 py-3 font-bold">
                      {booking.slot.facilityName}
                    </td>
                    <td className="px-5 py-3">
                      {formatDate(booking.slot.startsAt)}
                    </td>
                    <td className="px-5 py-3">
                      {formatTimeRange(
                        booking.slot.startsAt,
                        booking.slot.endsAt,
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p>{booking.captain.fullName}</p>
                      <p className="text-xs text-text-secundar">
                        {booking.captain.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={booking.status}
                        label={BOOKING_STATUS_LABELS[booking.status]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="grid gap-3 md:hidden">
            {items.map((booking) => (
              <li key={booking.id}>
                <Card padding="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{booking.slot.facilityName}</p>
                    <StatusBadge
                      status={booking.status}
                      label={BOOKING_STATUS_LABELS[booking.status]}
                    />
                  </div>
                  <p className="mt-1 text-sm">
                    {formatDate(booking.slot.startsAt)} ·{' '}
                    {formatTimeRange(
                      booking.slot.startsAt,
                      booking.slot.endsAt,
                    )}
                  </p>
                  <p className="mt-1 text-sm text-text-secundar">
                    {booking.captain.fullName} · {booking.captain.email}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
