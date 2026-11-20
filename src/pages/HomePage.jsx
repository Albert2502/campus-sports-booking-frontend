import { useQuery } from '@tanstack/react-query';

import { errorMessage } from '../api/errors';
import { getFacilities } from '../api/facilities';
import { useAuth } from '../auth/AuthContext';
import { FieldIcon } from '../components/icons';
import {
  Avatar,
  ButtonLink,
  Card,
  ErrorState,
  LoadingState,
} from '../components/ui';
import { firstName, formatDate, monthlyRemainingText } from '../lib/format';

const SUGGESTION_COUNT = 3;

function FacilityCard({ facility }) {
  const image = facility.images[0];
  return (
    <Card padding="p-4" className="flex flex-col gap-3">
      {image ? (
        <img
          src={image.url}
          alt={facility.name}
          className="aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-bordura"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-fundal text-principala/40 ring-1 ring-bordura">
          <FieldIcon className="size-10" />
        </div>
      )}
      <div>
        <h3 className="text-base font-bold">{facility.name}</h3>
        <p className="text-sm text-text-secundar">
          {facility.sport.name} · {facility.capacity} jucători
        </p>
      </div>
      <ButtonLink
        to={`/facilitati/${facility.id}`}
        variant="outline"
        className="w-full"
      >
        Închiriază
      </ButtonLink>
    </Card>
  );
}

function Suggestions() {
  const facilities = useQuery({
    queryKey: ['facilities', 'active'],
    queryFn: getFacilities,
  });
  const suggestions = facilities.data?.slice(0, SUGGESTION_COUNT) ?? [];

  return (
    <section>
      <h2 className="mb-4 text-base font-bold">Sugestii de facilități</h2>
      {facilities.isPending && <LoadingState />}
      {facilities.isError && (
        <ErrorState
          text={errorMessage(facilities.error)}
          onRetry={() => facilities.refetch()}
        />
      )}
      {facilities.isSuccess && suggestions.length === 0 && (
        <p className="text-text-secundar">
          Nu există facilități disponibile momentan.
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </section>
  );
}

function AccountStatus({ user }) {
  const isActive = user.status === 'active';
  return (
    <div className="md:flex-1">
      <p className="flex items-center gap-2 text-[15px] font-bold">
        <span
          className={`size-2.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-red-600'}`}
          aria-hidden="true"
        />
        {isActive ? 'Cont activ' : 'Cont blocat'}
      </p>
      <p className="mt-1 text-sm">
        {isActive || !user.blockedUntil
          ? monthlyRemainingText(user)
          : `Poți rezerva din nou după ${formatDate(user.blockedUntil)}.`}
      </p>
    </div>
  );
}

/** Screen 00 Bun venit (Figma), data from GET /users/me and /facilities. */
export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-5 md:flex-row md:items-center md:gap-10">
        <div className="flex items-start justify-between gap-4 md:block md:flex-1">
          <div>
            <h1 className="text-[24px] leading-tight font-bold md:text-[32px]">
              Bun venit, {firstName(user.fullName)}!
            </h1>
            <p className="mt-1 hidden text-sm text-text-secundar md:block">
              Alege un teren pentru următoarea ta sesiune de antrenament.
            </p>
          </div>
          <Avatar fullName={user.fullName} className="md:hidden" />
        </div>
        <AccountStatus user={user} />
        <ButtonLink to="/calendar" className="w-full md:w-auto md:px-8">
          Închiriază un teren
        </ButtonLink>
      </Card>
      <Suggestions />
    </div>
  );
}
