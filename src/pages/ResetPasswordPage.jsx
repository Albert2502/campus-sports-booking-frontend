import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { confirmPasswordReset } from '../api/auth';
import { errorCode, errorMessage, fieldErrors } from '../api/errors';
import AuthCard from '../components/AuthCard';
import TextField from '../components/TextField';
import { Button } from '../components/ui';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, { error: 'Parola nouă are cel puțin 8 caractere.' }),
    confirmPassword: z.string().min(1, { error: 'Repetă parola nouă.' }),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    error: 'Parolele nu coincid.',
    path: ['confirmPassword'],
  });

function InvalidLink({ message }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <p
        role="alert"
        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
      >
        {message}
      </p>
      <Link
        to="/parola-uitata"
        className="text-center text-sm font-bold text-principala hover:underline"
      >
        Cere un link nou
      </Link>
    </div>
  );
}

/** Opened from the reset email: /resetare-parola?token=... */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function onSubmit({ newPassword }) {
    try {
      await confirmPasswordReset(token, newPassword);
      navigate('/login', {
        replace: true,
        state: {
          notice: 'Parola a fost schimbată. Autentifică-te cu parola nouă.',
        },
      });
    } catch (error) {
      if (errorCode(error) === 'RESET_TOKEN_INVALID') {
        setError('root.link', { message: errorMessage(error) });
        return;
      }
      const message = fieldErrors(error).newPassword;
      if (message) {
        setError('newPassword', { type: 'server', message });
      } else {
        setError('root.server', { message: errorMessage(error) });
      }
    }
  }

  let content;
  if (!token) {
    content = (
      <InvalidLink message="Linkul nu este complet. Deschide-l din nou din email sau cere unul nou." />
    );
  } else if (errors.root?.link) {
    content = <InvalidLink message={errors.root.link.message} />;
  } else {
    content = (
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <TextField
          id="newPassword"
          label="Parola nouă"
          type="password"
          autoComplete="new-password"
          hint="Cel puțin 8 caractere."
          registration={register('newPassword')}
          error={errors.newPassword?.message}
        />
        <TextField
          id="confirmPassword"
          label="Repetă parola nouă"
          type="password"
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
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
          {isSubmitting ? 'Se salvează…' : 'Salvează parola'}
        </Button>
      </form>
    );
  }

  return <AuthCard title="Parolă nouă">{content}</AuthCard>;
}
