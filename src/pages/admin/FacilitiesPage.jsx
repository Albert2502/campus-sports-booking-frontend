import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { errorMessage } from '../../api/errors';
import { getAdminFacilities } from '../../api/facilities';
import { getSports } from '../../api/sports';
import { Card, ErrorState, LoadingState } from '../../components/ui';
import { normalizeText, STATUS_LABELS } from '../../lib/facilities';
import { AdminSelect, AdminTextField } from './AdminFields';
import { adminButton } from './adminStyles';
import FacilityDrawer from './FacilityDrawer';
import FacilityList from './FacilityList';
import StatusConfirmDialog from './StatusConfirmDialog';

const NO_FILTERS = { search: '', sportId: '', status: '' };
const TOAST_MS = 4000;

function matches(facility, { search, sportId, status }) {
  if (sportId && String(facility.sport.id) !== sportId) {
    return false;
  }
  if (status && facility.status !== status) {
    return false;
  }
  const query = normalizeText(search);
  if (!query) {
    return true;
  }
  return (
    normalizeText(facility.name).includes(query) ||
    normalizeText(facility.location).includes(query)
  );
}

/** Screen "Admin – Facilități": list, filters, add/edit drawer, (de)activation. */
export default function FacilitiesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(NO_FILTERS);
  // `null` closed, `{facility: null}` adding, `{facility}` editing.
  const [drawer, setDrawer] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);

  const facilitiesQuery = useQuery({
    queryKey: ['admin-facilities'],
    queryFn: getAdminFacilities,
  });
  const sportsQuery = useQuery({ queryKey: ['sports'], queryFn: getSports });
  const sports = sportsQuery.data ?? [];

  const visible = useMemo(
    () => (facilitiesQuery.data ?? []).filter((f) => matches(f, filters)),
    [facilitiesQuery.data, filters],
  );

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const closeDrawer = useCallback(() => setDrawer(null), []);
  const closeDialog = useCallback(() => setToggling(null), []);

  function saved() {
    setDrawer(null);
    setToggling(null);
    queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    // The user pages list the active facilities under ['facilities', ...].
    queryClient.invalidateQueries({ queryKey: ['facilities'] });
    // A new object restarts the timer when two saves follow each other.
    setToast({ text: '✓ Facilitatea a fost salvată' });
  }

  function setFilter(name) {
    return (event) => setFilters({ ...filters, [name]: event.target.value });
  }

  function renderBody() {
    if (facilitiesQuery.isPending) {
      return <LoadingState />;
    }
    if (facilitiesQuery.isError) {
      return (
        <ErrorState
          text={errorMessage(facilitiesQuery.error)}
          onRetry={() => facilitiesQuery.refetch()}
        />
      );
    }
    if (facilitiesQuery.data.length === 0) {
      return (
        <Card padding="p-8" className="text-center">
          <h2 className="text-xl font-bold">Nu există facilități încă</h2>
          <p className="mt-2 text-text-secundar">
            Adaugă facilitățile sportive disponibile în campus.
          </p>
          <button
            type="button"
            className={`${adminButton.primary} mt-5`}
            onClick={() => setDrawer({ facility: null })}
          >
            Adaugă prima facilitate
          </button>
        </Card>
      );
    }
    if (visible.length === 0) {
      return (
        <Card padding="p-8" className="text-center">
          <p className="text-text-secundar">
            Nicio facilitate nu corespunde căutării.
          </p>
          <button
            type="button"
            className={`${adminButton.outline} mt-5`}
            onClick={() => setFilters(NO_FILTERS)}
          >
            Șterge filtrele
          </button>
        </Card>
      );
    }
    return (
      <FacilityList
        facilities={visible}
        onEdit={(facility) => setDrawer({ facility })}
        onToggle={setToggling}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-0">
      <header>
        <h1 className="text-[28px] font-bold md:text-[32px]">
          Gestionare facilități
        </h1>
        <p className="mt-1 text-text-secundar">
          Facilitățile sportive din campus
        </p>
      </header>

      {sportsQuery.isError && (
        <ErrorState
          text={errorMessage(sportsQuery.error)}
          onRetry={() => sportsQuery.refetch()}
        />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="md:flex-1">
          <AdminTextField
            id="filter-search"
            label="Caută facilitate"
            type="search"
            placeholder="Caută facilitate"
            registration={{
              value: filters.search,
              onChange: setFilter('search'),
            }}
          />
        </div>
        <div className="md:w-56">
          <AdminSelect
            id="filter-sport"
            label="Tip"
            registration={{
              value: filters.sportId,
              onChange: setFilter('sportId'),
            }}
          >
            <option value="">Toate</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div className="md:w-56">
          <AdminSelect
            id="filter-status"
            label="Stare"
            registration={{
              value: filters.status,
              onChange: setFilter('status'),
            }}
          >
            <option value="">Toate</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </AdminSelect>
        </div>
        {/* A wrapper, because the button's inline-flex would win over hidden. */}
        <div className="hidden md:block">
          <button
            type="button"
            className={adminButton.primary}
            onClick={() => setDrawer({ facility: null })}
          >
            + Adaugă facilitate
          </button>
        </div>
      </div>

      {renderBody()}

      <div className="fixed inset-x-0 bottom-[65px] z-10 bg-suprafata p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
        <button
          type="button"
          className={`${adminButton.primary} w-full`}
          onClick={() => setDrawer({ facility: null })}
        >
          + Adaugă facilitate
        </button>
      </div>

      {toast && (
        <p
          role="status"
          className="fixed bottom-[185px] left-6 z-50 w-[calc(100%-3rem)] max-w-[400px] rounded-xl bg-suprafata p-4 text-base font-bold shadow-lg ring-1 ring-bordura md:bottom-8 md:left-[17rem] md:w-[400px]"
        >
          {toast.text}
        </p>
      )}

      {drawer && (
        <FacilityDrawer
          facility={drawer.facility}
          sports={sports}
          onClose={closeDrawer}
          onSaved={saved}
        />
      )}
      {toggling && (
        <StatusConfirmDialog
          facility={toggling}
          onClose={closeDialog}
          onDone={saved}
        />
      )}
    </div>
  );
}
