import { Link } from 'react-router';

import { initials } from '../lib/format';
import { FieldIcon } from './icons';

export function Logo({ inverted = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-bold ${
        inverted ? 'bg-suprafata text-principala' : 'text-principala'
      }`}
    >
      <FieldIcon className="size-5" />
      Campus Field
    </span>
  );
}

export function Avatar({ fullName, className = '' }) {
  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-suprafata text-xs font-bold text-principala ring-1 ring-bordura ${className}`}
      aria-hidden="true"
    >
      {initials(fullName)}
    </span>
  );
}

export function Card({ children, className = '', padding = 'p-5' }) {
  return (
    <section
      className={`rounded-2xl bg-suprafata shadow-sm ring-1 ring-bordura ${padding} ${className}`}
    >
      {children}
    </section>
  );
}

const BUTTON_STYLES = {
  primary:
    'bg-principala text-white hover:bg-principala-inchis disabled:bg-gray-300 disabled:text-gray-500',
  outline:
    'bg-suprafata text-text ring-1 ring-text hover:bg-fundal disabled:text-gray-400 disabled:ring-gray-300',
};

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({ variant = 'primary', className = '', ...props }) {
  return (
    <Link
      className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}

export function LoadingState({ text = 'Se încarcă…' }) {
  return (
    <p className="py-10 text-center text-text-secundar" role="status">
      {text}
    </p>
  );
}

export function ErrorState({ text, onRetry }) {
  return (
    <div
      className="rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200"
      role="alert"
    >
      <p>{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-bold underline"
        >
          Încearcă din nou
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const tone =
    status === 'confirmed' || status === 'checked_in'
      ? 'bg-green-50 text-green-800 ring-green-200'
      : status === 'pending'
        ? 'bg-orange-50 text-orange-800 ring-orange-200'
        : 'bg-gray-100 text-gray-700 ring-gray-200';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${tone}`}
    >
      {label}
    </span>
  );
}
