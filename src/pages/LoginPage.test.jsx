import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { describe, expect, test } from 'vitest';

import { renderApp } from '../test/render';
import { server } from '../test/server';

describe('screen 01 Autentificare', () => {
  test('shows the field errors for an empty form', async () => {
    renderApp({ route: '/login' });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Autentificare' }),
    );
    expect(
      screen.getByLabelText('Email instituțional'),
    ).toHaveAccessibleDescription('Introdu emailul instituțional.');
    expect(screen.getByLabelText('Parolă')).toHaveAccessibleDescription(
      'Introdu parola.',
    );
  });

  test('signs in and opens the main page', async () => {
    const user = {
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
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json({ token: 't', expiresAt: null, user }),
      ),
      http.get('/api/v1/users/me', () => HttpResponse.json(user)),
      http.get('/api/v1/facilities', () => HttpResponse.json([])),
    );
    renderApp({ route: '/login' });
    const u = userEvent.setup();
    await u.type(
      await screen.findByLabelText('Email instituțional'),
      'ana@campus.test',
    );
    await u.type(screen.getByLabelText('Parolă'), 'parola123');
    await u.click(screen.getByRole('button', { name: 'Autentificare' }));

    expect(
      await screen.findByRole('heading', { name: /Bun venit, Ana/ }),
    ).toBeInTheDocument();
  });
});
