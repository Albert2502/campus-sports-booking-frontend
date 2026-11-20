import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';

import { requestPasswordReset } from '../api/auth';
import { errorMessage, fieldErrors } from '../api/errors';
import AuthCard from '../components/AuthCard';
import TextField from '../components/TextField';
import { Button } from '../components/ui';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'Introdu emailul instituțional.' })
    .pipe(z.email({ error: 'Introdu o adresă de email validă.' })),
});

/** "Ai uitat parola?" from screen 01: asks for the reset email. */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function onSubmit({ email }) {
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      const message = fieldErrors(error).email;
      if (message) {
        setError('email', { type: 'server', message });
      } else {
        setError('root.server', { message: errorMessage(error) });
      }
    }
  }

  return (
    <AuthCard
      title="Ai uitat parola?"
      subtitle="Îți trimitem pe email un link pentru o parolă nouă."
    >
      {sent ? (
        // The same text for every address: the API does not say which exist.
        <p
          role="status"
          className="mt-6 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-green-200"
        >
          Dacă adresa are un cont, am trimis un email cu linkul de resetare.
          Linkul e valabil o oră.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <TextField
            id="email"
            label="Email instituțional"
            type="email"
            autoComplete="username"
            placeholder="nume@universitate.ro"
            registration={register('email')}
            error={errors.email?.message}
          />
          {errors.root?.server && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
              role="alert"
            >
              {errors.root.server.message}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Se trimite…' : 'Trimite linkul'}
          </Button>
        </form>
      )}
      <Link
        to="/login"
        className="mt-5 block text-center text-sm text-principala hover:underline"
      >
        Înapoi la autentificare
      </Link>
    </AuthCard>
  );
}
