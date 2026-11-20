import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';

import { errorCode, errorMessage, fieldErrors } from '../api/errors';
import { changePassword } from '../api/users';
import TextField from '../components/TextField';
import { Button, ButtonLink, Card } from '../components/ui';

// The server has the last word (e.g. the 72-byte limit); these checks only
// save a round trip for the common mistakes.
const schema = z
  .object({
    currentPassword: z.string().min(1, { error: 'Introdu parola curentă.' }),
    newPassword: z
      .string()
      .min(8, { error: 'Parola nouă are cel puțin 8 caractere.' }),
    confirmPassword: z.string().min(1, { error: 'Repetă parola nouă.' }),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    error: 'Parolele nu coincid.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: 'Parola nouă trebuie să fie diferită de cea curentă.',
    path: ['newPassword'],
  });

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** "Schimbă parola", opened from screen 09 Profil (no Figma frame of its own). */
export default function ChangePasswordPage() {
  const [changed, setChanged] = useState(false);
  const successRef = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // The form disappears on success; focus moves to the message so screen
  // readers announce it and keyboard users are not left on a removed button.
  useEffect(() => {
    if (changed) {
      successRef.current?.focus();
    }
  }, [changed]);

  async function onSubmit({ currentPassword, newPassword }) {
    try {
      await changePassword(currentPassword, newPassword);
      setChanged(true);
    } catch (error) {
      if (errorCode(error) === 'WRONG_PASSWORD') {
        setError('currentPassword', {
          type: 'server',
          message: errorMessage(error),
        });
        return;
      }
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
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link to="/profil" className="text-sm text-principala hover:underline">
        ‹ Înapoi la profil
      </Link>
      <Card>
        <h1 className="text-[24px] font-bold">Schimbă parola</h1>
        {changed ? (
          <div className="mt-4 flex flex-col gap-4">
            <p
              ref={successRef}
              tabIndex={-1}
              role="status"
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-green-200"
            >
              Parola a fost schimbată. Folosește parola nouă la următoarea
              autentificare.
            </p>
            <ButtonLink to="/profil" variant="outline">
              Înapoi la profil
            </ButtonLink>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-4 flex flex-col gap-4"
          >
            <TextField
              id="currentPassword"
              label="Parola curentă"
              type="password"
              autoComplete="current-password"
              registration={register('currentPassword')}
              error={errors.currentPassword?.message}
            />
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
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Se salvează…' : 'Schimbă parola'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
