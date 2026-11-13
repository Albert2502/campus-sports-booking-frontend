import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { errorMessage } from '../api/errors';
import { homePathFor, useAuth } from '../auth/AuthContext';
import { FieldIcon } from '../components/icons';
import { Button } from '../components/ui';

function landingPath(user, from) {
  if (typeof from !== 'string') {
    return homePathFor(user);
  }
  const wantsAdmin = from.startsWith('/admin');
  return wantsAdmin === (user.role === 'admin') ? from : homePathFor(user);
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-center text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-11 rounded-lg bg-fundal px-3 text-base ring-1 outline-none focus:ring-2 focus:ring-principala ${
          error ? 'ring-red-500' : 'ring-bordura'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { status, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={homePathFor(user)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Introdu emailul instituțional.';
    }
    if (!password) {
      errors.password = 'Introdu parola.';
    }
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      navigate(landingPath(signedIn, location.state?.from), { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="login-backdrop flex min-h-dvh items-center justify-center p-4">
      <main className="w-full max-w-sm rounded-2xl bg-suprafata/95 px-6 py-8 shadow-xl ring-1 ring-bordura backdrop-blur sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-principala text-white shadow">
            <FieldIcon className="size-8" />
          </span>
          <h1 className="mt-5 text-[32px] leading-tight font-bold">
            Autentificare
          </h1>
          <p className="mt-2 text-sm text-text-secundar">
            Rezervare facilități sportive
            <br />
            Acces cu un cont instituțional.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <Field
            id="email"
            label="Email instituțional"
            type="email"
            autoComplete="username"
            placeholder="nume@universitate.ro"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <Field
            id="password"
            label="Parolă"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          {formError && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
              role="alert"
            >
              {formError}
            </p>
          )}
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Se verifică…' : 'Autentificare'}
          </Button>
        </form>
      </main>
    </div>
  );
}
