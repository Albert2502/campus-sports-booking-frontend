import { useAuth } from '../auth/AuthContext';
import { Avatar, ButtonLink, Card } from '../components/ui';
import { firstName, formatDate, monthlyRemainingText } from '../lib/format';

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

/** Screen 00 Bun venit (Figma), data from GET /users/me. */
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
    </div>
  );
}
