import { adminInput } from './adminStyles';

function Field({ id, label, error, hint, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </label>
      {children(describedBy)}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-text-secundar">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function ringClass(error) {
  return error ? 'ring-red-500' : 'ring-bordura';
}

/** A labelled 48px input; `registration` comes from React Hook Form. */
export function AdminTextField({
  id,
  label,
  error,
  hint,
  registration,
  ...inputProps
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      {(describedBy) => (
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${adminInput} ${ringClass(error)}`}
          {...registration}
          {...inputProps}
        />
      )}
    </Field>
  );
}

/** A labelled 48px select; options are passed as children. */
export function AdminSelect({
  id,
  label,
  error,
  hint,
  registration,
  children,
  ...selectProps
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      {(describedBy) => (
        <select
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${adminInput} ${ringClass(error)}`}
          {...registration}
          {...selectProps}
        >
          {children}
        </select>
      )}
    </Field>
  );
}

export function AdminTextarea({
  id,
  label,
  error,
  hint,
  registration,
  ...props
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      {(describedBy) => (
        <textarea
          id={id}
          rows={3}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-[10px] bg-suprafata px-3 py-3 text-base ring-1 outline-none focus:ring-2 focus:ring-principala ${ringClass(error)}`}
          {...registration}
          {...props}
        />
      )}
    </Field>
  );
}

/** A pill switch; `checked` shows the knob on the right. */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-principala ${
        checked ? 'bg-principala' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 size-[22px] rounded-full bg-white shadow transition-all ${
          checked ? 'left-[20px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
