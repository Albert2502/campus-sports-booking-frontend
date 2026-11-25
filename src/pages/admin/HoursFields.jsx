import { useWatch } from 'react-hook-form';

import { Switch } from './AdminFields';
import { adminInput } from './adminStyles';
import { DAY_NAMES } from './facilityForm';

/**
 * "Program pe zile": the switch and, when on, the 7 day rows. DESIGN §5, 9.
 * @param {{form: Object}} props the React Hook Form instance of the drawer
 */
export default function HoursFields({ form }) {
  const { register, control, setValue, formState } = form;
  const enabled = useWatch({ control, name: 'hoursEnabled' });
  const hours = useWatch({ control, name: 'hours' });
  const rowErrors = formState.errors.hours;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-bold">Program pe zile</span>
        <Switch
          label="Program pe zile"
          checked={enabled}
          onChange={(value) =>
            setValue('hoursEnabled', value, { shouldDirty: true })
          }
        />
      </div>
      {!enabled && (
        <p className="text-sm text-text-secundar">
          Fără program, facilitatea poate fi rezervată oricând.
        </p>
      )}
      {enabled && (
        <ul className="flex flex-col">
          {DAY_NAMES.map((day, index) => {
            const closed = hours[index].closed;
            const error =
              rowErrors?.[index]?.closesAt?.message ??
              rowErrors?.[index]?.opensAt?.message;
            return (
              <li key={day} className="py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-20 shrink-0 text-sm font-bold">{day}</span>
                  <Switch
                    label={`${day} închis`}
                    checked={closed}
                    onChange={(value) =>
                      setValue(`hours.${index}.closed`, value, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <span className="text-sm text-text-secundar">Închis</span>
                  <div className="ml-auto flex items-center gap-2">
                    {closed ? (
                      <span className="text-text-secundar">—</span>
                    ) : (
                      <>
                        <input
                          type="time"
                          aria-label={`${day}: deschide`}
                          aria-invalid={error ? 'true' : undefined}
                          className={`${adminInput} w-[110px] px-2 ring-bordura`}
                          {...register(`hours.${index}.opensAt`)}
                        />
                        <input
                          type="time"
                          aria-label={`${day}: închide`}
                          aria-invalid={error ? 'true' : undefined}
                          className={`${adminInput} w-[110px] px-2 ring-bordura`}
                          {...register(`hours.${index}.closesAt`)}
                        />
                      </>
                    )}
                  </div>
                </div>
                {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
