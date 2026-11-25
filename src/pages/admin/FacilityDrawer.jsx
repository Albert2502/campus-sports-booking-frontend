import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { createFacility, updateFacility } from '../../api/facilities';
import { errorMessage, fieldErrors } from '../../api/errors';
import { ErrorState } from '../../components/ui';
import { AdminSelect, AdminTextarea, AdminTextField } from './AdminFields';
import { adminButton } from './adminStyles';
import {
  facilitySchema,
  formFieldFor,
  MIN_BOOKING_OPTIONS,
  toFormValues,
  toRequestBody,
} from './facilityForm';
import HoursFields from './HoursFields';
import { AmenityChips, StatusSegments } from './FacilityChoices';
import FacilityImages from './FacilityImages';
import useModalBehavior from './useModalBehavior';

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xl font-bold">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Right-side panel (full screen on phones) to add a facility or, with
 * `facility`, to edit it. Mounted only while open; the parent re-keys it when
 * a created facility turns the drawer into edit mode.
 * @param {{facility: ?Object, sports: Array<Object>, onClose: function,
 *     onSaved: function(Object, {created: boolean}),
 *     onImagesChanged: function}} props
 */
export default function FacilityDrawer({
  facility,
  sports,
  onClose,
  onSaved,
  onImagesChanged,
}) {
  const form = useForm({
    resolver: zodResolver(facilitySchema),
    defaultValues: toFormValues(facility),
  });
  const { register, handleSubmit, setError, setFocus, control, formState } =
    form;
  const { errors } = formState;
  const status = useWatch({ control, name: 'status' });
  const title = facility ? 'Editează facilitate' : 'Adaugă facilitate';

  useModalBehavior(onClose);
  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  const save = useMutation({
    mutationFn: (body) =>
      facility ? updateFacility(facility.id, body) : createFacility(body),
    onSuccess: (result) => onSaved(result, { created: !facility }),
    onError: (error) => {
      const unmapped = [];
      for (const [path, message] of Object.entries(fieldErrors(error))) {
        const field = formFieldFor(path);
        if (field) {
          setError(field, { type: 'server', message });
        } else {
          unmapped.push(message);
        }
      }
      if (Object.keys(fieldErrors(error)).length === 0) {
        setError('root.server', { message: errorMessage(error) });
      } else if (unmapped.length > 0) {
        setError('root.server', { message: unmapped.join(' ') });
      }
    },
  });

  function onSubmit(values) {
    save.mutate(toRequestBody(values));
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="facility-drawer-title"
        className="flex h-full w-full flex-col bg-suprafata shadow-xl md:w-[480px]"
      >
        <header className="flex items-center justify-between p-6">
          <h2 id="facility-drawer-title" className="text-2xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Închide"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-2xl text-text-secundar hover:bg-fundal"
          >
            ×
          </button>
        </header>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
            <Section title="Informații generale">
              <AdminTextField
                id="facility-name"
                label="Denumire"
                registration={register('name')}
                error={errors.name?.message}
              />
              <AdminSelect
                id="facility-sport"
                label="Tip sport"
                registration={register('sportId')}
                error={errors.sportId?.message}
              >
                <option value="">Alege sportul</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </AdminSelect>
              <AdminTextField
                id="facility-location"
                label="Locație / clădire"
                registration={register('location')}
                error={errors.location?.message}
              />
              <AdminTextField
                id="facility-capacity"
                label="Capacitate (nr. persoane)"
                type="number"
                min="1"
                registration={register('capacity')}
                error={errors.capacity?.message}
              />
              <AdminTextarea
                id="facility-description"
                label="Descriere"
                registration={register('description')}
                error={errors.description?.message}
              />
            </Section>
            <Section title="Imagini">
              {facility ? (
                <FacilityImages
                  facility={facility}
                  onChanged={onImagesChanged}
                />
              ) : (
                <p className="text-text-secundar">
                  Salvează facilitatea ca să adaugi imagini.
                </p>
              )}
            </Section>
            <Section title="Preț și program">
              <AdminTextField
                id="facility-price"
                label="Preț / oră (lei)"
                type="number"
                step="0.01"
                min="0"
                hint="0 = gratuit"
                registration={register('pricePerHour')}
                error={errors.pricePerHour?.message}
              />
              <AdminSelect
                id="facility-min-booking"
                label="Durată minimă rezervare"
                registration={register('minBookingMinutes')}
              >
                {MIN_BOOKING_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minute
                  </option>
                ))}
              </AdminSelect>
              <HoursFields form={form} />
            </Section>
            <Section title="Dotări">
              <AmenityChips form={form} />
            </Section>
            <Section title="Stare">
              <StatusSegments form={form} />
              {status === 'maintenance' && (
                <AdminTextField
                  id="facility-note"
                  label="Motiv / perioadă mentenanță"
                  placeholder="Opțional"
                  registration={register('maintenanceNote')}
                  error={errors.maintenanceNote?.message}
                />
              )}
            </Section>
          </div>
          {errors.root?.server && (
            <div className="px-6 pb-3">
              <ErrorState text={errors.root.server.message} />
            </div>
          )}
          <footer className="flex gap-3 p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className={`${adminButton.outline} flex-1 px-3 text-[15px] whitespace-nowrap`}
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className={`${adminButton.primary} flex-1 px-3 text-[15px] whitespace-nowrap`}
            >
              {save.isPending ? 'Se salvează…' : 'Salvează facilitatea'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
