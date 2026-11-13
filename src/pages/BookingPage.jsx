import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { getBooking } from '../api/endpoints';
import { errorMessage } from '../api/errors';
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  TagIcon,
  UsersIcon,
} from '../components/icons';
import {
  ButtonLink,
  Card,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '../components/ui';
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  formatDayLong,
  formatPrice,
  formatTimeRange,
} from '../lib/format';

function Detail({ icon: DetailIcon, children }) {
  return (
    <li className="flex items-center gap-3">
      <DetailIcon className="size-5 text-principala" />
      <span>{children}</span>
    </li>
  );
}

export default function BookingPage() {
  const { bookingId } = useParams();
  const booking = useQuery({
    queryKey: ['bookings', 'detail', bookingId],
    queryFn: () => getBooking(bookingId),
  });

  if (booking.isPending) {
    return <LoadingState />;
  }
  if (booking.isError) {
    return (
      <ErrorState
        text={errorMessage(booking.error)}
        onRetry={() => booking.refetch()}
      />
    );
  }

  const { slot, status } = booking.data;
  const confirmed = status === 'confirmed';
  const dayLong = formatDayLong(slot.startsAt);
  const year = formatDate(slot.startsAt).split(' ').at(-1);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        {confirmed && (
          <span className="flex size-12 items-center justify-center rounded-full bg-green-50 text-green-700 ring-1 ring-green-200">
            <CheckIcon className="size-7" />
          </span>
        )}
        <h1 className="mt-4 text-[24px] font-bold md:text-[32px]">
          {confirmed ? 'Rezervare confirmată' : 'Rezervare'}
        </h1>
        <p className="mt-1 text-sm text-text-secundar">
          {confirmed
            ? 'Rezervarea a fost confirmată cu succes.'
            : `Starea rezervării: ${BOOKING_STATUS_LABELS[status]}.`}
        </p>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[24px] font-bold">{slot.facilityName}</h2>
          <StatusBadge status={status} label={BOOKING_STATUS_LABELS[status]} />
        </div>
        <ul className="flex flex-col gap-3 text-[15px]">
          <Detail icon={CalendarIcon}>
            {dayLong} {year}
          </Detail>
          <Detail icon={ClockIcon}>
            {formatTimeRange(slot.startsAt, slot.endsAt)}
          </Detail>
          <Detail icon={UsersIcon}>
            {slot.sportName} · {booking.data.totalPlaces} jucători
          </Detail>
          <Detail icon={TagIcon}>
            <strong>{formatPrice(booking.data.amountDue)}</strong>
          </Detail>
        </ul>
        <div className="grid gap-3 sm:grid-cols-2">
          <ButtonLink to="/rezervari">Rezervările mele</ButtonLink>
          <ButtonLink to="/" variant="outline">
            Acasă
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
