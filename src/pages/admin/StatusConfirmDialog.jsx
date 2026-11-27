import { useMutation } from '@tanstack/react-query';

import { updateFacility } from '../../api/facilities';
import { errorMessage } from '../../api/errors';
import { ErrorState } from '../../components/ui';
import { adminButton } from './adminStyles';
import useModalBehavior from './useModalBehavior';

/**
 * Confirms deactivating (or, for an inactive facility, reactivating) one.
 * @param {{facility: Object, onClose: function, onDone: function}} props
 */
export default function StatusConfirmDialog({ facility, onClose, onDone }) {
  const reactivate = facility.status === 'inactive';
  const title = reactivate
    ? `Reactivezi facilitatea „${facility.name}”?`
    : `Dezactivezi facilitatea „${facility.name}”?`;
  const text = reactivate
    ? 'Va apărea din nou utilizatorilor.'
    : 'Nu va mai apărea utilizatorilor. O poți reactiva oricând.';

  useModalBehavior(onClose);
  const change = useMutation({
    mutationFn: () =>
      updateFacility(facility.id, {
        status: reactivate ? 'active' : 'inactive',
      }),
    onSuccess: onDone,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-text"
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-suprafata p-6 shadow-xl"
      >
        <h2 id="status-dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        <p id="status-dialog-text" className="text-text-secundar">
          {text}
        </p>
        {change.isError && <ErrorState text={errorMessage(change.error)} />}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`${adminButton.outline} flex-1`}
          >
            Renunță
          </button>
          <button
            type="button"
            disabled={change.isPending}
            onClick={() => change.mutate()}
            className={`${adminButton.primary} flex-1`}
          >
            {reactivate ? 'Reactivează' : 'Dezactivează'}
          </button>
        </div>
      </div>
    </div>
  );
}
