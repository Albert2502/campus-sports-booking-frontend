import { useQuery } from '@tanstack/react-query';

import { getFacilities } from '../../api/endpoints';
import { errorMessage } from '../../api/errors';
import { Card, ErrorState, LoadingState } from '../../components/ui';
import { formatPrice } from '../../lib/format';

const STATUS_LABELS = {
  active: 'Activă',
  maintenance: 'În mentenanță',
  inactive: 'Inactivă',
};

function hours(facility) {
  return facility.opensAt
    ? `${facility.opensAt}–${facility.closesAt}`
    : 'Fără restricție';
}

export default function AdminFacilitiesPage() {
  const facilities = useQuery({
    queryKey: ['facilities', 'all'],
    queryFn: () => getFacilities('all'),
  });
  const items = facilities.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold md:text-[32px]">Facilități</h1>
        <p className="mt-1 text-sm text-text-secundar">
          Terenurile și sălile din campus.
        </p>
      </div>

      {facilities.isPending && <LoadingState />}
      {facilities.isError && (
        <ErrorState
          text={errorMessage(facilities.error)}
          onRetry={() => facilities.refetch()}
        />
      )}
      {facilities.data && items.length === 0 && (
        <Card>
          <p>Nu există facilități.</p>
        </Card>
      )}

      {items.length > 0 && (
        <>
          <Card padding="p-0" className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-bordura text-text-secundar">
                <tr>
                  <th className="px-5 py-3 font-bold">Facilitate</th>
                  <th className="px-5 py-3 font-bold">Sport</th>
                  <th className="px-5 py-3 font-bold">Capacitate</th>
                  <th className="px-5 py-3 font-bold">Preț / oră</th>
                  <th className="px-5 py-3 font-bold">Program</th>
                  <th className="px-5 py-3 font-bold">Stare</th>
                </tr>
              </thead>
              <tbody>
                {items.map((facility) => (
                  <tr
                    key={facility.id}
                    className="border-b border-bordura last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {facility.images[0] && (
                          <img
                            src={facility.images[0].url}
                            alt=""
                            className="h-10 w-16 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-bold">{facility.name}</p>
                          <p className="text-xs text-text-secundar">
                            {facility.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{facility.sport.name}</td>
                    <td className="px-5 py-3">{facility.capacity}</td>
                    <td className="px-5 py-3">
                      {formatPrice(facility.pricePerHour)}
                    </td>
                    <td className="px-5 py-3">{hours(facility)}</td>
                    <td className="px-5 py-3">
                      {STATUS_LABELS[facility.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="grid gap-3 md:hidden">
            {items.map((facility) => (
              <li key={facility.id}>
                <Card padding="p-4">
                  <p className="font-bold">{facility.name}</p>
                  <p className="text-sm text-text-secundar">
                    {facility.sport.name} · {facility.capacity} jucători ·{' '}
                    {formatPrice(facility.pricePerHour)}
                  </p>
                  <p className="mt-1 text-sm">
                    {hours(facility)} · {STATUS_LABELS[facility.status]}
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
