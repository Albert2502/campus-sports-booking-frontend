/**
 * A labelled input with its error message, for React Hook Form fields.
 * @param {{id: string, label: string, error?: string, hint?: string,
 *     registration: Object, labelClassName?: string}} props
 */
export default function TextField({
  id,
  label,
  error,
  hint,
  registration,
  labelClassName = '',
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={`text-sm font-bold ${labelClassName}`}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`h-11 rounded-lg bg-fundal px-3 text-base ring-1 outline-none focus:ring-2 focus:ring-principala ${
          error ? 'ring-red-500' : 'ring-bordura'
        }`}
        {...registration}
        {...inputProps}
      />
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
