import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { errorMessage, fieldErrors } from '../api/errors';
import { useAuth } from '../auth/AuthContext';
import { FieldIcon } from '../components/icons';
import TextField from '../components/TextField';
import { Button } from '../components/ui';

// Only the format is checked here; the domain and the password rules come
// from the API (VALIDATION_ERROR details).
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'Introdu emailul instituțional.' })
    .pipe(z.email({ error: 'Introdu o adresă de email validă.' })),
  password: z.string().min(1, { error: 'Introdu parola.' }),
});

/** Screen 01 Autentificare (Figma): a card over the pitch backdrop. */
export default function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  // ProtectedRoute sends visitors here with the page they asked for.
  const from = location.state?.from;
  const target = typeof from === 'string' ? from : '/';
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Also the redirect after a successful login: login() sets the user.
  if (status === 'authenticated') {
    return <Navigate to={target} replace />;
  }

  async function onSubmit({ email, password }) {
    try {
      await login(email, password);
    } catch (error) {
      const fields = Object.entries(fieldErrors(error));
      for (const [field, message] of fields) {
        setError(field, { type: 'server', message });
      }
      if (fields.length === 0) {
        setError('root.server', { message: errorMessage(error) });
      }
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
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <TextField
            id="email"
            label="Email instituțional"
            labelClassName="text-center"
            type="email"
            autoComplete="username"
            placeholder="nume@universitate.ro"
            registration={register('email')}
            error={errors.email?.message}
          />
          <TextField
            id="password"
            label="Parolă"
            labelClassName="text-center"
            type="password"
            autoComplete="current-password"
            registration={register('password')}
            error={errors.password?.message}
          />
          {errors.root?.server && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
              role="alert"
            >
              {errors.root.server.message}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Se verifică…' : 'Autentificare'}
          </Button>
        </form>
      </main>
    </div>
  );
}
