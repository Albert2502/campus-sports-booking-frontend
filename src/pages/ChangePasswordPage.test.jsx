import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { beforeEach, describe, expect, test } from 'vitest';

import { renderApp } from '../test/render';
import { server } from '../test/server';

const USER = {
  id: 2,
  fullName: 'Ana Popescu',
  email: 'ana@campus.test',
  role: 'student',
  status: 'active',
  blockedUntil: null,
  bookingsThisMonth: 0,
  monthlyLimit: 1,
  noShowCount: 0,
};

let requests;

function answerChange(resolver) {
  server.use(
    http.post('/api/v1/users/me/password', async ({ request }) => {
      requests.push(await request.json());
      return resolver();
    }),
  );
}

async function fillForm({ current, next, repeat }) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Parola curentă'), current);
  await user.type(screen.getByLabelText('Parola nouă', { exact: true }), next);
  await user.type(screen.getByLabelText('Repetă parola nouă'), repeat);
  await user.click(screen.getByRole('button', { name: 'Schimbă parola' }));
}

beforeEach(() => {
  requests = [];
  server.use(http.get('/api/v1/users/me', () => HttpResponse.json(USER)));
});

describe('Schimbă parola', () => {
  test('changes the password and confirms it', async () => {
    answerChange(() => new HttpResponse(null, { status: 204 }));
    renderApp({ route: '/profil/parola', token: 'token' });

    await fillForm({
      current: 'parola123',
      next: 'parola-noua',
      repeat: 'parola-noua',
    });

    const message = await screen.findByRole('status');
    expect(message).toHaveTextContent('Parola a fost schimbată.');
    expect(message).toHaveFocus();
    expect(requests).toEqual([
      { currentPassword: 'parola123', newPassword: 'parola-noua' },
    ]);
  });

  test('stops before sending when the new passwords differ', async () => {
    answerChange(() => new HttpResponse(null, { status: 204 }));
    renderApp({ route: '/profil/parola', token: 'token' });

    await fillForm({
      current: 'parola123',
      next: 'parola-noua',
      repeat: 'alta-parola',
    });

    expect(await screen.findByText('Parolele nu coincid.')).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  test('checks length and difference before sending', async () => {
    answerChange(() => new HttpResponse(null, { status: 204 }));
    renderApp({ route: '/profil/parola', token: 'token' });
    expect(
      await screen.findByLabelText('Parola nouă', { exact: true }),
    ).toHaveAccessibleDescription('Cel puțin 8 caractere.');

    await fillForm({ current: 'parola123', next: 'scurt', repeat: 'scurt' });
    expect(
      screen.getByLabelText('Parola nouă', { exact: true }),
    ).toHaveAccessibleDescription('Parola nouă are cel puțin 8 caractere.');

    const user = userEvent.setup();
    const next = screen.getByLabelText('Parola nouă', { exact: true });
    const repeat = screen.getByLabelText('Repetă parola nouă');
    await user.clear(next);
    await user.type(next, 'parola123');
    await user.clear(repeat);
    await user.type(repeat, 'parola123');
    await user.click(screen.getByRole('button', { name: 'Schimbă parola' }));
    expect(
      await screen.findByText(
        'Parola nouă trebuie să fie diferită de cea curentă.',
      ),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  test('shows a server error that belongs to no field', async () => {
    answerChange(() =>
      HttpResponse.json(
        { code: 'INTERNAL_ERROR', message: 'x' },
        { status: 500 },
      ),
    );
    renderApp({ route: '/profil/parola', token: 'token' });

    await fillForm({
      current: 'parola123',
      next: 'parola-noua',
      repeat: 'parola-noua',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A apărut o eroare pe server.',
    );
  });

  test('shows a wrong current password under its field', async () => {
    answerChange(() =>
      HttpResponse.json(
        { code: 'WRONG_PASSWORD', message: 'Parola curentă nu este corectă.' },
        { status: 422 },
      ),
    );
    renderApp({ route: '/profil/parola', token: 'token' });

    await fillForm({
      current: 'gresita123',
      next: 'parola-noua',
      repeat: 'parola-noua',
    });

    expect(
      await screen.findByLabelText('Parola curentă'),
    ).toHaveAccessibleDescription('Parola curentă nu este corectă.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Schimbă parola' }),
      ).toBeEnabled(),
    );
  });

  test('shows the server validation message under the field', async () => {
    answerChange(() =>
      HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Date invalide',
          details: {
            fields: {
              newPassword:
                'Parola nouă e prea lungă (cel mult 72 de caractere).',
            },
          },
        },
        { status: 400 },
      ),
    );
    renderApp({ route: '/profil/parola', token: 'token' });

    await fillForm({
      current: 'parola123',
      next: 'ă'.repeat(40),
      repeat: 'ă'.repeat(40),
    });

    expect(
      await screen.findByText(
        'Parola nouă e prea lungă (cel mult 72 de caractere).',
      ),
    ).toBeInTheDocument();
  });

  test('opens from the profile', async () => {
    renderApp({ route: '/profil', token: 'token' });
    await userEvent.click(
      await screen.findByRole('link', { name: 'Schimbă parola' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Schimbă parola' }),
    ).toBeInTheDocument();
  });
});
