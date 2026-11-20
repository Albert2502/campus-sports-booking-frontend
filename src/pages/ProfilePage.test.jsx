import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { describe, expect, test } from 'vitest';

import { server } from '../test/server';
import { renderApp } from '../test/render';

const STUDENT = {
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

function answerMe(body, status = 200) {
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(body, { status })),
  );
}

describe('screen 09 Profil', () => {
  test('shows the profile and the account status from /users/me', async () => {
    answerMe(STUDENT);
    renderApp({ route: '/profil', token: 'token' });

    expect(
      await screen.findByRole('heading', { name: 'Profil' }),
    ).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(within(main).getByText('Ana Popescu')).toBeInTheDocument();
    expect(screen.getByText('ana@campus.test')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Cont activ')).toBeInTheDocument();
    expect(
      screen.getByText('Rezervări rămase luna aceasta: 1 din 1'),
    ).toBeInTheDocument();
    expect(screen.getByText('Neprezentări: 0')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Schimbă parola' }),
    ).toHaveAttribute('href', '/profil/parola');
  });

  test('shows a teacher without a monthly limit', async () => {
    answerMe({
      ...STUDENT,
      role: 'teacher',
      monthlyLimit: null,
      bookingsThisMonth: 2,
    });
    renderApp({ route: '/profil', token: 'token' });

    expect(await screen.findByText('Profesor')).toBeInTheDocument();
    expect(
      screen.getByText('Rezervări luna aceasta: 2 (fără limită)'),
    ).toBeInTheDocument();
  });

  test('shows when a blocked account is unblocked', async () => {
    answerMe({
      ...STUDENT,
      status: 'blocked',
      blockedUntil: '2027-04-23T00:00:00+03:00',
      noShowCount: 2,
    });
    renderApp({ route: '/profil', token: 'token' });

    expect(
      await screen.findByRole('heading', {
        name: 'Cont blocat până la 23 aprilie 2027',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Neprezentări: 2')).toBeInTheDocument();
    expect(screen.queryByText('Cont activ')).not.toBeInTheDocument();
  });

  test('shows "Cont blocat" when the block has no end date', async () => {
    answerMe({ ...STUDENT, status: 'blocked', blockedUntil: null });
    renderApp({ route: '/profil', token: 'token' });

    expect(
      await screen.findByRole('heading', { name: 'Cont blocat' }),
    ).toBeInTheDocument();
  });

  test('shows the server error and loads again on retry', async () => {
    let calls = 0;
    server.use(
      http.get('/api/v1/users/me', () => {
        calls += 1;
        // The first answer signs the user in; the profile visit then fails.
        return calls === 1
          ? HttpResponse.json(STUDENT)
          : HttpResponse.json(
              { code: 'INTERNAL_ERROR', message: 'x' },
              { status: 500 },
            );
      }),
    );
    renderApp({ route: '/profil', token: 'token' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A apărut o eroare pe server.',
    );
    answerMe(STUDENT);
    await userEvent.click(
      screen.getByRole('button', { name: 'Încearcă din nou' }),
    );
    expect(await screen.findByText('Cont activ')).toBeInTheDocument();
  });

  test('is reachable from the phone bar and from the name on desktop', async () => {
    answerMe(STUDENT);
    renderApp({ route: '/', token: 'token' });

    expect(await screen.findByRole('link', { name: 'Profil' })).toHaveAttribute(
      'href',
      '/profil',
    );
    expect(screen.getByRole('link', { name: /Ana Popescu/ })).toHaveAttribute(
      'href',
      '/profil',
    );
    // "Ieșire" stays only in the desktop top bar.
    expect(screen.getAllByRole('button', { name: 'Ieșire' })).toHaveLength(1);
  });

  test('signs out with "Deconectare"', async () => {
    answerMe(STUDENT);
    renderApp({ route: '/profil', token: 'token' });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Deconectare' }),
    );

    expect(
      await screen.findByRole('button', { name: /autentific/i }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('csb.token')).toBeNull();
  });

  test('sends a visitor without a session to the login page', async () => {
    renderApp({ route: '/profil' });

    expect(
      await screen.findByRole('button', { name: /autentific/i }),
    ).toBeInTheDocument();
  });
});
